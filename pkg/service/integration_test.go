package service_test

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"strings"
	"testing"
	"time"

	"fullstack-template/configs"
	"fullstack-template/db/migrations"
	"fullstack-template/pkg/model"
	"fullstack-template/pkg/repo"
	"fullstack-template/pkg/service"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "modernc.org/sqlite"
)

func testStore(t *testing.T) *repo.Store {
	t.Helper()
	store, _ := testStoreWithDB(t)
	return store
}

func testStoreWithDB(t *testing.T) (*repo.Store, *sql.DB) {
	t.Helper()
	db, err := sql.Open("sqlite", "file:"+t.TempDir()+"/test.db?_pragma=foreign_keys(1)")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	if err := migrations.Up(context.Background(), db, "sqlite"); err != nil {
		t.Fatal(err)
	}
	return repo.NewStore(db, "sqlite"), db
}

func TestAdminUserSearchAndPagination(t *testing.T) {
	store, db := testStoreWithDB(t)
	ctx := context.Background()
	for _, user := range []model.User{
		{ID: "a", Username: "Alice", Email: "alice@example.com", PasswordHash: "hash", Status: model.UserStatusActive},
		{ID: "b", Username: "use%name", Email: "percent@example.com", PasswordHash: "hash", Status: model.UserStatusActive},
		{ID: "c", Username: "use_name", Email: "CHARLIE@example.com", PasswordHash: "hash", Status: model.UserStatusDisabled},
		{ID: "deleted", Username: "deleted-user", Email: "deleted@example.com", PasswordHash: "hash", Status: model.UserStatusActive},
	} {
		if err := store.CreateUser(ctx, &user); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := db.Exec(`UPDATE users SET created_at = '2024-01-01 00:00:00'; UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 'deleted'`); err != nil {
		t.Fatal(err)
	}
	admin := service.NewAdminService(store)
	for _, tc := range []struct {
		name  string
		req   model.ListUsersRequest
		ids   string
		total int64
	}{
		{"first page", model.ListUsersRequest{Page: 1, PageSize: 2}, "cb", 3},
		{"second page", model.ListUsersRequest{Page: 2, PageSize: 2}, "a", 3},
		{"username ignores case and outer spaces", model.ListUsersRequest{Query: " ALICE "}, "a", 1},
		{"email ignores case", model.ListUsersRequest{Query: "charlie@"}, "c", 1},
		{"literal percent", model.ListUsersRequest{Query: "%"}, "b", 1},
		{"literal underscore", model.ListUsersRequest{Query: "_"}, "c", 1},
		{"no match", model.ListUsersRequest{Query: "missing"}, "", 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			result, err := admin.List(ctx, tc.req)
			if err != nil {
				t.Fatal(err)
			}
			var ids string
			for _, user := range result.Items {
				ids += user.ID
			}
			if ids != tc.ids || result.Pagination.Total != tc.total {
				t.Fatalf("matching users = %q total=%d, want %q total=%d", ids, result.Pagination.Total, tc.ids, tc.total)
			}
		})
	}
	for _, req := range []model.ListUsersRequest{{Page: -1}, {PageSize: -1}, {PageSize: 101}} {
		if _, err := admin.List(ctx, req); !errors.Is(err, model.ErrPagination) {
			t.Errorf("invalid pagination %#v error = %v", req, err)
		}
	}
}

func TestDisablingAccountRollsBackIfSessionRevocationFails(t *testing.T) {
	configs.AppConfig = &configs.Config{Session: configs.SessionConfig{ExpireHour: 24}}
	store, db := testStoreWithDB(t)
	ctx := context.Background()
	auth := service.NewAuthService(store)
	user, token, err := auth.Register(ctx, model.RegisterRequest{Email: "alice@example.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`CREATE TRIGGER prevent_session_delete BEFORE DELETE ON sessions BEGIN SELECT RAISE(ABORT, 'test session revocation failure'); END`); err != nil {
		t.Fatal(err)
	}
	if _, err := service.NewAdminService(store).SetStatus(ctx, "admin", user.User.ID, model.UpdateUserStatusRequest{Status: model.UserStatusDisabled}); err == nil {
		t.Fatal("disabling account unexpectedly succeeded when session revocation failed")
	}
	session, _, err := auth.Session(ctx, token)
	if err != nil {
		t.Fatalf("failed operation invalidated the original active session: %v", err)
	}
	if session.User.Status != model.UserStatusActive {
		t.Fatalf("failed operation left account status = %s", session.User.Status)
	}
}

func TestSessionCreationRequiresActiveAccount(t *testing.T) {
	for _, state := range []string{"disabled", "soft-deleted"} {
		t.Run(state, func(t *testing.T) {
			store, db := testStoreWithDB(t)
			ctx := context.Background()
			user := &model.User{ID: "user", Username: "alice", Email: "alice@example.com", PasswordHash: "hash", Status: model.UserStatusActive}
			if err := store.CreateUser(ctx, user); err != nil {
				t.Fatal(err)
			}
			// Login may have already read this active account before its password check finishes.
			if state == "disabled" {
				if err := store.UpdateUserStatus(ctx, user.ID, model.UserStatusDisabled); err != nil {
					t.Fatal(err)
				}
			} else if _, err := db.Exec(`UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 'user'`); err != nil {
				t.Fatal(err)
			}
			err := store.CreateSession(ctx, &model.Session{ID: "late-login", UserID: user.ID, TokenHash: "late-hash", ExpiresAt: time.Now().Add(time.Hour)})
			if !errors.Is(err, repo.ErrNotFound) {
				t.Fatalf("late session for %s account error = %v", state, err)
			}
			var sessions int
			if err := db.QueryRow(`SELECT COUNT(*) FROM sessions`).Scan(&sessions); err != nil {
				t.Fatal(err)
			}
			if sessions != 0 {
				t.Fatalf("%s account received %d new sessions", state, sessions)
			}
		})
	}
}

func TestRegisterCreatesSession(t *testing.T) {
	configs.AppConfig = &configs.Config{Session: configs.SessionConfig{ExpireHour: 24}}
	store := testStore(t)
	auth := service.NewAuthService(store)
	result, token, err := auth.Register(context.Background(), model.RegisterRequest{Email: "alice@example.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	if token == "" || result.User.ID == "" || result.User.Email != "alice@example.com" {
		t.Fatalf("session = %#v token=%q", result, token)
	}
	session, _, err := auth.Session(context.Background(), token)
	if err != nil {
		t.Fatal(err)
	}
	if session.User.ID != result.User.ID {
		t.Fatalf("session user = %s", session.User.ID)
	}
}

func TestRegisterAssignsUsernameFromEmail(t *testing.T) {
	configs.AppConfig = &configs.Config{Session: configs.SessionConfig{ExpireHour: 24}}
	store := testStore(t)
	auth := service.NewAuthService(store)
	ctx := context.Background()

	result, _, err := auth.Register(ctx, model.RegisterRequest{Email: "Alice.Smith+tag@Example.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(result.User.Username, "alice-smith-") || len(result.User.Username) > 50 {
		t.Fatalf("username %q is not a bounded name derived from the email", result.User.Username)
	}

	other, _, err := auth.Register(ctx, model.RegisterRequest{Email: "alice.smith@other.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	if other.User.Username == result.User.Username {
		t.Fatal("same local part produced the same username")
	}
	if _, _, err := auth.Register(ctx, model.RegisterRequest{Email: "alice.smith+tag@example.com", Password: "secret12"}); !errors.Is(err, model.ErrAccountConflict) {
		t.Fatalf("duplicate email error = %v", err)
	}

	fellback, _, err := auth.Register(ctx, model.RegisterRequest{Email: "!!!@example.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(fellback.User.Username, "example-") {
		t.Fatalf("symbol-only local part username = %q", fellback.User.Username)
	}

	longLocal := strings.Repeat("a", 80)
	longUser, _, err := auth.Register(ctx, model.RegisterRequest{Email: longLocal + "@example.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	if len(longUser.User.Username) > 50 || !strings.HasPrefix(longUser.User.Username, "aaa") {
		t.Fatalf("long email username = %q", longUser.User.Username)
	}

	updated, err := service.NewUserService(store).Update(ctx, result.User.ID, model.UpdateProfileRequest{Username: "ada"})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Username != "ada" {
		t.Fatalf("profile username = %q", updated.Username)
	}
}

func TestPostgresMigrations(t *testing.T) {
	dsn := os.Getenv("TEST_POSTGRES_DSN")
	if dsn == "" {
		t.Skip("TEST_POSTGRES_DSN not set")
	}
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	for _, table := range []string{"sessions", "users", "schema_migrations"} {
		_, _ = db.Exec(`DROP TABLE IF EXISTS ` + table + ` CASCADE`)
	}
	if err := migrations.Up(context.Background(), db, "postgres"); err != nil {
		t.Fatal(err)
	}
	store := repo.NewStore(db, "postgres")
	ctx := context.Background()
	configs.AppConfig = &configs.Config{Session: configs.SessionConfig{ExpireHour: 24}}
	u := &model.User{ID: "test-user", Username: "postgres-user", Email: "postgres@example.com", PasswordHash: "hash", Status: model.UserStatusActive}
	if err := store.CreateUser(ctx, u); err != nil {
		t.Fatal(err)
	}
	admin := service.NewAdminService(store)
	if err := admin.Grant(ctx, u.ID); err != nil {
		t.Fatal(err)
	}
	operator, err := store.GetUserByID(ctx, u.ID)
	if err != nil || !operator.IsAdmin {
		t.Fatalf("postgres administrator grant failed: %v", err)
	}
	auth := service.NewAuthService(store)
	user, token, err := auth.Register(ctx, model.RegisterRequest{Email: "subject@example.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	list, err := admin.List(ctx, model.ListUsersRequest{Query: "SUBJECT@", PageSize: 1})
	if err != nil {
		t.Fatal(err)
	}
	if list.Pagination.Total != 1 || len(list.Items) != 1 || list.Items[0].ID != user.User.ID || list.Items[0].IsAdmin {
		t.Fatalf("postgres user search did not find the regular account: %#v", list)
	}
	if _, err := admin.SetStatus(ctx, u.ID, user.User.ID, model.UpdateUserStatusRequest{Status: model.UserStatusDisabled}); err != nil {
		t.Fatal(err)
	}
	if err := store.CreateSession(ctx, &model.Session{ID: "late-login", UserID: user.User.ID, TokenHash: "late-hash", ExpiresAt: time.Now().Add(time.Hour)}); !errors.Is(err, repo.ErrNotFound) {
		t.Fatalf("postgres late session after disable error = %v", err)
	}
	if _, err := admin.SetStatus(ctx, u.ID, user.User.ID, model.UpdateUserStatusRequest{Status: model.UserStatusActive}); err != nil {
		t.Fatal(err)
	}
	if _, _, err := auth.Session(ctx, token); !errors.Is(err, repo.ErrNotFound) {
		t.Fatalf("postgres old session survived disable and enable: %v", err)
	}
}

package service_test

import (
	"context"
	"database/sql"
	"os"
	"testing"

	"go-react-template/configs"
	"go-react-template/db/migrations"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
	"go-react-template/pkg/service"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "modernc.org/sqlite"
)

func testStore(t *testing.T) *repo.Store {
	t.Helper()
	db, err := sql.Open("sqlite", "file:"+t.TempDir()+"/test.db?_pragma=foreign_keys(1)")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	if err := migrations.Up(context.Background(), db, "sqlite"); err != nil {
		t.Fatal(err)
	}
	return repo.NewStore(db, "sqlite")
}

func TestRegisterCreatesTenantOwner(t *testing.T) {
	configs.AppConfig = &configs.Config{Session: configs.SessionConfig{ExpireHour: 24}}
	store := testStore(t)
	auth := service.NewAuthService(store)
	result, token, err := auth.Register(context.Background(), model.RegisterRequest{Username: "alice", Email: "alice@example.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	if token == "" {
		t.Fatal("empty session token")
	}
	if len(result.Tenants) != 1 {
		t.Fatalf("want one tenant, got %d", len(result.Tenants))
	}
	member, err := store.GetMember(context.Background(), result.Tenants[0].ID, result.User.ID)
	if err != nil {
		t.Fatal(err)
	}
	if member.Role != model.TenantRoleOwner {
		t.Fatalf("want owner, got %s", member.Role)
	}
}

func TestTenantMembershipIsolation(t *testing.T) {
	configs.AppConfig = &configs.Config{Session: configs.SessionConfig{ExpireHour: 24}}
	store := testStore(t)
	auth := service.NewAuthService(store)
	a, _, _ := auth.Register(context.Background(), model.RegisterRequest{Username: "alice", Email: "alice@example.com", Password: "secret12"})
	b, _, _ := auth.Register(context.Background(), model.RegisterRequest{Username: "bobby", Email: "bob@example.com", Password: "secret12"})
	if _, err := store.GetMember(context.Background(), a.Tenants[0].ID, b.User.ID); err == nil {
		t.Fatal("unrelated user unexpectedly belongs to tenant")
	}
}

func TestSoftDeletedTenantBlocksMemberAccess(t *testing.T) {
	configs.AppConfig = &configs.Config{Session: configs.SessionConfig{ExpireHour: 24}}
	store := testStore(t)
	auth := service.NewAuthService(store)
	ctx := context.Background()
	owner, _, err := auth.Register(ctx, model.RegisterRequest{Username: "alice", Email: "alice@example.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	tenantID := owner.Tenants[0].ID
	if err := service.NewTenantService(store).Delete(ctx, tenantID); err != nil {
		t.Fatal(err)
	}
	// 租户软删除后，成员查询必须失败，否则该租户下的成员管理接口仍然可用。
	if _, err := store.GetMember(ctx, tenantID, owner.User.ID); err == nil {
		t.Fatal("soft-deleted tenant still resolves membership")
	}
}

func TestDeletingTenantClearsSessionActiveTenant(t *testing.T) {
	configs.AppConfig = &configs.Config{Session: configs.SessionConfig{ExpireHour: 24}}
	store := testStore(t)
	auth := service.NewAuthService(store)
	ctx := context.Background()
	owner, token, err := auth.Register(ctx, model.RegisterRequest{Username: "alice", Email: "alice@example.com", Password: "secret12"})
	if err != nil {
		t.Fatal(err)
	}
	tenantID := owner.Tenants[0].ID
	if err := service.NewTenantService(store).Delete(ctx, tenantID); err != nil {
		t.Fatal(err)
	}
	// 删除租户后会话不能再指向它，否则 /auth/session 会返回一个不在 tenants 列表中的 ID。
	result, _, err := auth.Session(ctx, token)
	if err != nil {
		t.Fatal(err)
	}
	if result.ActiveTenantID != nil {
		t.Fatalf("session still points at deleted tenant %q", *result.ActiveTenantID)
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
	for _, table := range []string{"sessions", "tenant_members", "tenants", "users", "schema_migrations"} {
		_, _ = db.Exec(`DROP TABLE IF EXISTS ` + table + ` CASCADE`)
	}
	if err := migrations.Up(context.Background(), db, "postgres"); err != nil {
		t.Fatal(err)
	}
	store := repo.NewStore(db, "postgres")
	u := &model.User{ID: "test-user", Username: "postgres-user", Email: "postgres@example.com", PasswordHash: "hash", Status: model.UserStatusActive}
	if err := store.CreateUser(context.Background(), u); err != nil {
		t.Fatal(err)
	}
}

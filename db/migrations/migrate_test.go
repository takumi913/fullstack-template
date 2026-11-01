package migrations

import (
	"context"
	"database/sql"
	"os"
	"strings"
	"testing"

	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "modernc.org/sqlite"
)

// 旧实现把文件名和版本号写死为 000001，新增迁移不会被执行。
// 这里直接校验加载逻辑：目录里有几个 .up.sql 就该识别出几个，且按版本升序。
func TestLoadMigrationsSortedByVersion(t *testing.T) {
	for _, dialect := range []string{"sqlite", "postgres"} {
		got, err := loadMigrations(dialect)
		if err != nil {
			t.Fatalf("%s: %v", dialect, err)
		}
		if len(got) == 0 {
			t.Fatalf("%s: 未找到任何迁移文件", dialect)
		}
		for i := 1; i < len(got); i++ {
			if got[i].version <= got[i-1].version {
				t.Fatalf("%s: 迁移未按版本升序: %v", dialect, got)
			}
		}
		if got[0].version != 1 {
			t.Fatalf("%s: 首个迁移版本应为 1，实际 %d", dialect, got[0].version)
		}
	}
}

func TestParseVersion(t *testing.T) {
	valid := map[string]int{
		"000001_init.up.sql":         1,
		"000002_add_projects.up.sql": 2,
		"000010_x.up.sql":            10,
	}
	for name, want := range valid {
		got, err := parseVersion(name)
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		if got != want {
			t.Fatalf("%s: 期望版本 %d，实际 %d", name, want, got)
		}
	}
	for _, name := range []string{"init.up.sql", "abc_init.up.sql", "000000_init.up.sql"} {
		if _, err := parseVersion(name); err == nil {
			t.Fatalf("%s: 期望报错，实际通过", name)
		}
	}
}

func TestPersonalAccountMigrations(t *testing.T) {
	for _, dialect := range []string{"sqlite", "postgres"} {
		for _, startVersion := range []int{0, 1, 2} {
			name := dialect + "/fresh"
			switch startVersion {
			case 1:
				name = dialect + "/v1-workspaces"
			case 2:
				name = dialect + "/v2-personal-accounts"
			}
			t.Run(name, func(t *testing.T) {
				db := migrationTestDB(t, dialect)
				ctx := context.Background()
				if startVersion > 0 {
					if _, err := db.Exec(`CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY)`); err != nil {
						t.Fatal(err)
					}
					if err := apply(ctx, db, dialect, migration{version: 1, name: "000001_init.up.sql"}); err != nil {
						t.Fatal(err)
					}
					if startVersion == 1 {
						// Recreate the old dependency graph before upgrading an already applied v1.
						if _, err := db.Exec(`
						CREATE TABLE tenants (id TEXT PRIMARY KEY, created_by TEXT NOT NULL REFERENCES users(id));
						CREATE TABLE tenant_members (
							id TEXT PRIMARY KEY,
							tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
							user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
						);
						ALTER TABLE sessions ADD COLUMN active_tenant_id TEXT REFERENCES tenants(id) ON DELETE SET NULL;
						`); err != nil {
							t.Fatal(err)
						}
					} else if err := apply(ctx, db, dialect, migration{version: 2, name: "000002_drop_workspaces.up.sql"}); err != nil {
						t.Fatal(err)
					}
				} else if err := Up(ctx, db, dialect); err != nil {
					t.Fatal(err)
				}
				if _, err := db.Exec(`
					INSERT INTO users (id, username, email, password_hash, avatar_url, status)
					VALUES ('user-1', 'alice', 'alice@example.com', 'password-hash', '/alice.webp', 'active');
					INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, updated_at) VALUES
						('session-1', 'user-1', 'token-hash-1', '2099-01-02 03:04:05+00:00', '2024-01-02 03:04:05+00:00', '2025-01-02 03:04:05+00:00'),
						('session-2', 'user-1', 'token-hash-2', '2000-01-02 03:04:05+00:00', '2024-01-02 03:04:05+00:00', '2025-01-02 03:04:05+00:00');
				`); err != nil {
					t.Fatal(err)
				}
				if startVersion == 1 {
					if _, err := db.Exec(`
						INSERT INTO tenants (id, created_by) VALUES ('tenant-1', 'user-1');
						INSERT INTO tenant_members (id, tenant_id, user_id) VALUES ('member-1', 'tenant-1', 'user-1');
						UPDATE sessions SET active_tenant_id = 'tenant-1' WHERE id = 'session-1';
					`); err != nil {
						t.Fatal(err)
					}
				}
				for range 2 {
					if err := Up(ctx, db, dialect); err != nil {
						t.Fatal(err)
					}
				}
				assertPersonalAccountSchema(t, db, dialect)
			})
		}
	}
}

func migrationTestDB(t *testing.T, dialect string) *sql.DB {
	t.Helper()
	driver, dsn := "sqlite", "file:"+t.TempDir()+"/migrations.db?_pragma=foreign_keys(1)"
	if dialect == "postgres" {
		driver, dsn = "pgx", os.Getenv("TEST_POSTGRES_DSN")
		if dsn == "" {
			t.Skip("TEST_POSTGRES_DSN not set")
		}
	}
	db, err := sql.Open(driver, dsn)
	if err != nil {
		t.Fatal(err)
	}
	db.SetMaxOpenConns(1)
	t.Cleanup(func() { _ = db.Close() })
	if dialect == "postgres" {
		// Isolate migration fixtures from the service tests' public tables.
		schema := "migration_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
		if _, err := db.Exec(`CREATE SCHEMA ` + schema); err != nil {
			t.Fatal(err)
		}
		t.Cleanup(func() {
			if _, err := db.Exec(`DROP SCHEMA ` + schema + ` CASCADE`); err != nil {
				t.Error(err)
			}
		})
		if _, err := db.Exec(`SET search_path TO ` + schema); err != nil {
			t.Fatal(err)
		}
	}
	return db
}

func assertPersonalAccountSchema(t *testing.T, db *sql.DB, dialect string) {
	t.Helper()
	type schemaCheck struct {
		name  string
		query string
		want  int
	}
	checks := []schemaCheck{
		{"user preserved", `SELECT COUNT(*) FROM users WHERE id = 'user-1' AND username = 'alice' AND email = 'alice@example.com' AND password_hash = 'password-hash' AND avatar_url = '/alice.webp' AND status = 'active'`, 1},
		{"accounts default to non-admin", `SELECT COUNT(*) FROM users WHERE id = 'user-1' AND is_admin = FALSE`, 1},
		{"session identity and timestamps preserved", `SELECT COUNT(*) FROM sessions WHERE user_id = 'user-1' AND ((id = 'session-1' AND token_hash = 'token-hash-1' AND expires_at = '2099-01-02 03:04:05+00:00') OR (id = 'session-2' AND token_hash = 'token-hash-2' AND expires_at = '2000-01-02 03:04:05+00:00')) AND created_at = '2024-01-02 03:04:05+00:00' AND updated_at = '2025-01-02 03:04:05+00:00'`, 2},
	}
	if dialect == "sqlite" {
		checks = append(checks,
			schemaCheck{"workspace tables removed", `SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name IN ('tenants', 'tenant_members')`, 0},
			schemaCheck{"workspace column removed", `SELECT COUNT(*) FROM pragma_table_info('sessions') WHERE name = 'active_tenant_id'`, 0},
			schemaCheck{"session indexes preserved", `SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name IN ('idx_sessions_user_id', 'idx_sessions_expires_at')`, 2})
	} else {
		checks = append(checks,
			schemaCheck{"workspace tables removed", `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = current_schema() AND table_name IN ('tenants', 'tenant_members')`, 0},
			schemaCheck{"workspace column removed", `SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'sessions' AND column_name = 'active_tenant_id'`, 0},
			schemaCheck{"session indexes preserved", `SELECT COUNT(*) FROM pg_indexes WHERE schemaname = current_schema() AND indexname IN ('idx_sessions_user_id', 'idx_sessions_expires_at')`, 2})
	}
	for _, check := range checks {
		var got int
		if err := db.QueryRow(check.query).Scan(&got); err != nil {
			t.Fatalf("%s: %v", check.name, err)
		}
		if got != check.want {
			t.Errorf("%s: got %d, want %d", check.name, got, check.want)
		}
	}
	if _, err := db.Exec(`INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ('orphan', 'missing-user', 'orphan-hash', '2099-01-02 03:04:05+00:00')`); err == nil {
		t.Error("session foreign key no longer rejects an unknown user")
	}
	if _, err := db.Exec(`DELETE FROM users WHERE id = 'user-1'`); err != nil {
		t.Fatal(err)
	}
	var remaining int
	if err := db.QueryRow(`SELECT COUNT(*) FROM sessions`).Scan(&remaining); err != nil {
		t.Fatal(err)
	}
	if remaining != 0 {
		t.Errorf("deleting a user left %d sessions", remaining)
	}
}

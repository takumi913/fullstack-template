// Package migrations 按版本号顺序执行内嵌的 SQL 迁移。
package migrations

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"path"
	"sort"
	"strconv"
	"strings"
)

//go:embed sqlite/*.up.sql postgres/*.up.sql
var files embed.FS

// migration 是一个待执行的迁移文件。
type migration struct {
	version int
	name    string
}

// Up 执行所有尚未应用的迁移。新增迁移只需在对应方言目录下放入
// 形如 000002_add_xxx.up.sql 的文件，无需改动这里的代码。
func Up(ctx context.Context, db *sql.DB, driver string) error {
	dialect := driver
	if dialect == "postgresql" {
		dialect = "postgres"
	}
	if dialect != "sqlite" && dialect != "postgres" {
		return fmt.Errorf("不支持的数据库驱动: %s", driver)
	}
	if _, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)`); err != nil {
		return err
	}
	applied, err := appliedVersions(ctx, db)
	if err != nil {
		return err
	}
	pending, err := loadMigrations(dialect)
	if err != nil {
		return err
	}
	for _, m := range pending {
		if applied[m.version] {
			continue
		}
		if err := apply(ctx, db, dialect, m); err != nil {
			return err
		}
	}
	return nil
}

func appliedVersions(ctx context.Context, db *sql.DB) (map[int]bool, error) {
	rows, err := db.QueryContext(ctx, `SELECT version FROM schema_migrations`)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	applied := map[int]bool{}
	for rows.Next() {
		var v int
		if err := rows.Scan(&v); err != nil {
			return nil, err
		}
		applied[v] = true
	}
	return applied, rows.Err()
}

// loadMigrations 读取某个方言目录下的迁移文件并按版本号升序排列。
func loadMigrations(dialect string) ([]migration, error) {
	entries, err := fs.ReadDir(files, dialect)
	if err != nil {
		return nil, err
	}
	migrations := make([]migration, 0, len(entries))
	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || !strings.HasSuffix(name, ".up.sql") {
			continue
		}
		version, err := parseVersion(name)
		if err != nil {
			return nil, err
		}
		migrations = append(migrations, migration{version: version, name: name})
	}
	sort.Slice(migrations, func(i, j int) bool { return migrations[i].version < migrations[j].version })
	for i := 1; i < len(migrations); i++ {
		if migrations[i].version == migrations[i-1].version {
			return nil, fmt.Errorf("迁移版本号重复: %d (%s, %s)", migrations[i].version, migrations[i-1].name, migrations[i].name)
		}
	}
	return migrations, nil
}

// parseVersion 从 000002_add_xxx.up.sql 这样的文件名中取出版本号 2。
func parseVersion(name string) (int, error) {
	prefix, _, found := strings.Cut(name, "_")
	if !found {
		return 0, fmt.Errorf("迁移文件名缺少版本号前缀: %s", name)
	}
	version, err := strconv.Atoi(prefix)
	if err != nil {
		return 0, fmt.Errorf("迁移文件名版本号非法: %s", name)
	}
	if version <= 0 {
		return 0, fmt.Errorf("迁移版本号必须为正数: %s", name)
	}
	return version, nil
}

// apply 在单个事务内执行一个迁移文件并记录其版本号。
func apply(ctx context.Context, db *sql.DB, dialect string, m migration) error {
	content, err := files.ReadFile(path.Join(dialect, m.name))
	if err != nil {
		return err
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	rollback := func(cause error) error {
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return errors.Join(cause, rollbackErr)
		}
		return cause
	}
	for _, statement := range strings.Split(string(content), ";") {
		if strings.TrimSpace(statement) == "" {
			continue
		}
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return rollback(fmt.Errorf("执行迁移 %s 失败: %w", m.name, err))
		}
	}
	if _, err := tx.ExecContext(ctx, `INSERT INTO schema_migrations(version) VALUES (`+strconv.Itoa(m.version)+`)`); err != nil {
		return rollback(err)
	}
	return tx.Commit()
}

package migrations

import (
	"testing"
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

package repo

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"strings"
	"time"

	postgresdb "go-react-template/db/generated/postgres"
	sqlitedb "go-react-template/db/generated/sqlite"
)

type Store struct {
	db       *sql.DB
	driver   string
	sqlite   *sqlitedb.Queries
	postgres *postgresdb.Queries
}

func NewStore(db *sql.DB, driver string) *Store {
	s := &Store{db: db, driver: driver}
	if driver == "sqlite" {
		s.sqlite = sqlitedb.New(db)
	} else {
		s.postgres = postgresdb.New(db)
	}
	return s
}
func (s *Store) WithTx(ctx context.Context, fn func(*Store) error) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	child := &Store{db: s.db, driver: s.driver}
	if s.driver == "sqlite" {
		child.sqlite = s.sqlite.WithTx(tx)
	} else {
		child.postgres = s.postgres.WithTx(tx)
	}
	// fn panic 时必须回滚，否则连接不会归还；
	// SQLite 只有一个连接（MaxOpenConns=1），泄漏一次即全局死锁。
	defer func() {
		if r := recover(); r != nil {
			if rbErr := tx.Rollback(); rbErr != nil {
				log.Printf("panic 后事务回滚失败: %v", rbErr)
			}
			panic(r)
		}
	}()
	if err := fn(child); err != nil {
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return errors.Join(err, rollbackErr)
		}
		return err
	}
	return tx.Commit()
}
func normalize(err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil && (strings.Contains(strings.ToLower(err.Error()), "unique") || strings.Contains(strings.ToLower(err.Error()), "duplicate")) {
		return ErrConflict
	}
	return err
}
func nullableString(v *string) sql.NullString {
	if v == nil {
		return sql.NullString{}
	}
	return sql.NullString{String: *v, Valid: true}
}
func stringPtr(v sql.NullString) *string {
	if !v.Valid {
		return nil
	}
	x := v.String
	return &x
}
func timePtr(v sql.NullTime) *time.Time {
	if !v.Valid {
		return nil
	}
	x := v.Time
	return &x
}

package repo

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"strings"
	"time"

	postgresdb "fullstack-template/db/generated/postgres"
	sqlitedb "fullstack-template/db/generated/sqlite"
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

// WithTx commits the callback's data changes together and rolls them back on failure.
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
	// A panic must release SQLite's single connection before it propagates.
	defer func() {
		if r := recover(); r != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				slog.Error("panic 后事务回滚失败", "err", rollbackErr)
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
func timePtr(v sql.NullTime) *time.Time {
	if !v.Valid {
		return nil
	}
	x := v.Time
	return &x
}

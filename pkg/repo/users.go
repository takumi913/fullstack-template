package repo

import (
	"context"
	postgresdb "fullstack-template/db/generated/postgres"
	sqlitedb "fullstack-template/db/generated/sqlite"
	"fullstack-template/pkg/model"
)

func (s *Store) CreateUser(ctx context.Context, u *model.User) error {
	var err error
	if s.driver == "sqlite" {
		err = s.sqlite.CreateUser(ctx, sqlitedb.CreateUserParams{ID: u.ID, Username: u.Username, Email: u.Email, PasswordHash: u.PasswordHash, AvatarUrl: u.AvatarURL, Status: string(u.Status)})
	} else {
		err = s.postgres.CreateUser(ctx, postgresdb.CreateUserParams{ID: u.ID, Username: u.Username, Email: u.Email, PasswordHash: u.PasswordHash, AvatarUrl: u.AvatarURL, Status: string(u.Status)})
	}
	return normalize(err)
}
func mapSQLiteUser(u sqlitedb.User) *model.User {
	return &model.User{ID: u.ID, Username: u.Username, Email: u.Email, PasswordHash: u.PasswordHash, AvatarURL: u.AvatarUrl, Status: model.UserStatus(u.Status), CreatedAt: u.CreatedAt, UpdatedAt: u.UpdatedAt, DeletedAt: timePtr(u.DeletedAt)}
}
func mapPostgresUser(u postgresdb.User) *model.User {
	return &model.User{ID: u.ID, Username: u.Username, Email: u.Email, PasswordHash: u.PasswordHash, AvatarURL: u.AvatarUrl, Status: model.UserStatus(u.Status), CreatedAt: u.CreatedAt, UpdatedAt: u.UpdatedAt, DeletedAt: timePtr(u.DeletedAt)}
}
func (s *Store) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	if s.driver == "sqlite" {
		v, e := s.sqlite.GetUserByID(ctx, id)
		return mapSQLiteUser(v), normalize(e)
	}
	v, e := s.postgres.GetUserByID(ctx, id)
	return mapPostgresUser(v), normalize(e)
}
func (s *Store) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	if s.driver == "sqlite" {
		v, e := s.sqlite.GetUserByEmail(ctx, email)
		return mapSQLiteUser(v), normalize(e)
	}
	v, e := s.postgres.GetUserByEmail(ctx, email)
	return mapPostgresUser(v), normalize(e)
}
func (s *Store) GetUserByUsername(ctx context.Context, name string) (*model.User, error) {
	if s.driver == "sqlite" {
		v, e := s.sqlite.GetUserByUsername(ctx, name)
		return mapSQLiteUser(v), normalize(e)
	}
	v, e := s.postgres.GetUserByUsername(ctx, name)
	return mapPostgresUser(v), normalize(e)
}
func (s *Store) UpdateUserProfile(ctx context.Context, u *model.User) error {
	var n int64
	var e error
	if s.driver == "sqlite" {
		n, e = s.sqlite.UpdateUserProfile(ctx, sqlitedb.UpdateUserProfileParams{Username: u.Username, Email: u.Email, AvatarUrl: u.AvatarURL, ID: u.ID})
	} else {
		n, e = s.postgres.UpdateUserProfile(ctx, postgresdb.UpdateUserProfileParams{Username: u.Username, Email: u.Email, AvatarUrl: u.AvatarURL, ID: u.ID})
	}
	if e != nil {
		return normalize(e)
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}
func (s *Store) UpdateUserPassword(ctx context.Context, id, hash string) error {
	var n int64
	var e error
	if s.driver == "sqlite" {
		n, e = s.sqlite.UpdateUserPassword(ctx, sqlitedb.UpdateUserPasswordParams{PasswordHash: hash, ID: id})
	} else {
		n, e = s.postgres.UpdateUserPassword(ctx, postgresdb.UpdateUserPasswordParams{PasswordHash: hash, ID: id})
	}
	if e != nil {
		return e
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

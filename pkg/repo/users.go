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
	return &model.User{ID: u.ID, Username: u.Username, Email: u.Email, PasswordHash: u.PasswordHash, AvatarURL: u.AvatarUrl, Status: model.UserStatus(u.Status), IsAdmin: u.IsAdmin, CreatedAt: u.CreatedAt, UpdatedAt: u.UpdatedAt, DeletedAt: timePtr(u.DeletedAt)}
}
func mapPostgresUser(u postgresdb.User) *model.User {
	return &model.User{ID: u.ID, Username: u.Username, Email: u.Email, PasswordHash: u.PasswordHash, AvatarURL: u.AvatarUrl, Status: model.UserStatus(u.Status), IsAdmin: u.IsAdmin, CreatedAt: u.CreatedAt, UpdatedAt: u.UpdatedAt, DeletedAt: timePtr(u.DeletedAt)}
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

// CountUsers counts undeleted accounts containing search in their username or email.
func (s *Store) CountUsers(ctx context.Context, search string) (int64, error) {
	if s.driver == "sqlite" {
		n, err := s.sqlite.CountUsers(ctx, search)
		return n, normalize(err)
	}
	n, err := s.postgres.CountUsers(ctx, search)
	return n, normalize(err)
}

// ListUsers returns matching accounts in stable newest-first order.
func (s *Store) ListUsers(ctx context.Context, search string, limit, offset int) ([]model.User, error) {
	if s.driver == "sqlite" {
		rows, err := s.sqlite.ListUsers(ctx, sqlitedb.ListUsersParams{Search: search, PageLimit: int64(limit), PageOffset: int64(offset)})
		if err != nil {
			return nil, normalize(err)
		}
		users := make([]model.User, len(rows))
		for i, row := range rows {
			users[i] = *mapSQLiteUser(row)
		}
		return users, nil
	}
	rows, err := s.postgres.ListUsers(ctx, postgresdb.ListUsersParams{Search: search, PageLimit: int64(limit), PageOffset: int64(offset)})
	if err != nil {
		return nil, normalize(err)
	}
	users := make([]model.User, len(rows))
	for i, row := range rows {
		users[i] = *mapPostgresUser(row)
	}
	return users, nil
}

// UpdateUserStatus updates an undeleted, non-administrator account's status.
func (s *Store) UpdateUserStatus(ctx context.Context, id string, status model.UserStatus) error {
	var n int64
	var err error
	if s.driver == "sqlite" {
		n, err = s.sqlite.UpdateUserStatus(ctx, sqlitedb.UpdateUserStatusParams{Status: string(status), ID: id})
	} else {
		n, err = s.postgres.UpdateUserStatus(ctx, postgresdb.UpdateUserStatusParams{Status: string(status), ID: id})
	}
	if err != nil {
		return normalize(err)
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// SetUserAdmin grants administrator access to an active, undeleted account.
func (s *Store) SetUserAdmin(ctx context.Context, id string) error {
	var n int64
	var err error
	if s.driver == "sqlite" {
		n, err = s.sqlite.SetUserAdmin(ctx, id)
	} else {
		n, err = s.postgres.SetUserAdmin(ctx, id)
	}
	if err != nil {
		return normalize(err)
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

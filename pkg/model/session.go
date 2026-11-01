package model

import "time"

type Session struct {
	ID        string
	UserID    string
	TokenHash string
	ExpiresAt time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}
type AuthResponse struct {
	User UserResponse `json:"user"`
}

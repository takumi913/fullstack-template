package model

import "time"

type UserStatus string

const (
	UserStatusActive   UserStatus = "active"
	UserStatusDisabled UserStatus = "disabled"
)

type User struct {
	ID           string     `json:"id"`
	Username     string     `json:"username"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	AvatarURL    string     `json:"avatar_url"`
	Status       UserStatus `json:"status"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `json:"-"`
}
type UserResponse struct {
	ID        string     `json:"id"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	AvatarURL string     `json:"avatar_url"`
	Status    UserStatus `json:"status"`
}

func (u User) ToResponse() UserResponse {
	return UserResponse{ID: u.ID, Username: u.Username, Email: u.Email, AvatarURL: u.AvatarURL, Status: u.Status}
}

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type UpdateProfileRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	// 指针以区分「字段未提供」（nil，保持原值）和「显式清空」（""）。
	AvatarURL *string `json:"avatar_url"`
}
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

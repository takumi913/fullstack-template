// Package model 定义数据模型
package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User 用户模型.
type User struct {
	ID        string         `json:"id" gorm:"type:char(36);primarykey"`
	Username  string         `json:"username" gorm:"uniqueIndex;not null;size:50" validate:"required,min=3,max=50"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null;size:100" validate:"required,email"`
	Password  string         `json:"-" gorm:"size:255" validate:"omitempty,min=6"` // Google登录用户可能没有密码
	AvatarURL string         `json:"avatar_url" gorm:"size:500;comment:用户头像URL"`
	GoogleID  *string        `json:"-" gorm:"uniqueIndex;size:100;comment:Google用户ID"`
	LoginType LoginType      `json:"login_type" gorm:"type:varchar(20);not null;default:'local';comment:登录类型"`
	Role      UserRole       `json:"role" gorm:"type:varchar(20);not null;default:'user';comment:用户角色"`
	Bio       string         `json:"bio" gorm:"type:text"`
	IsBanned  bool           `json:"is_banned" gorm:"default:false;comment:用户是否被封禁"`
	BannedAt  *time.Time     `json:"banned_at,omitempty" gorm:"comment:封禁时间"`
	BanReason string         `json:"ban_reason,omitempty" gorm:"size:500;comment:封禁原因"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// LoginType 登录类型枚举.
type LoginType string

const (
	LoginTypeLocal  LoginType = "local"  // 本地注册登录
	LoginTypeGoogle LoginType = "google" // Google第三方登录
)

// UserRole 用户角色枚举.
type UserRole string

const (
	UserRoleUser  UserRole = "user"  // 普通用户
	UserRoleAdmin UserRole = "admin" // 管理员
)

// TableName 指定表名.
func (User) TableName() string {
	return "users"
}

// UserRegisterRequest 用户注册请求结构.
type UserRegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// UserLoginRequest 用户登录请求结构.
type UserLoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// UserResponse 用户响应结构（不包含密码）.
type UserResponse struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	AvatarURL string    `json:"avatar_url"`
	LoginType LoginType `json:"login_type"`
	Role      UserRole  `json:"role"`
	Bio       string    `json:"bio"`
}

// UserChangePasswordRequest 用户更改密码请求结构.
type UserChangePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=6"`
}

// GoogleLoginRequest Google登录请求结构.
type GoogleLoginRequest struct {
	IDToken string `json:"id_token" validate:"required"`
}

// ToResponse 将User转换为UserResponse.
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		AvatarURL: u.AvatarURL,
		LoginType: u.LoginType,
		Role:      u.Role,
		Bio:       u.Bio,
	}
}

// UserUpdateProfileRequest 用户更新个人资料请求结构.
type UserUpdateProfileRequest struct {
	Username string `json:"username" validate:"omitempty,min=3,max=50"`
	Email    string `json:"email" validate:"omitempty,email"`
	Bio      string `json:"bio" validate:"omitempty,max=500"`
}

// BeforeCreate 在创建前生成UUID.
func (u *User) BeforeCreate(_ *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}

	return nil
}

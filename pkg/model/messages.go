package model

import (
	"fmt"

	"golang.org/x/text/language"
)

// LocalizedMessage carries user-facing API copy without selecting a language in services.
type LocalizedMessage struct{ English, Chinese string }

var apiLanguageMatcher = language.NewMatcher([]language.Tag{language.English, language.SimplifiedChinese})

// ForLanguage resolves Accept-Language preferences, with English as the default.
func (m LocalizedMessage) ForLanguage(acceptLanguage string) string {
	_, index := language.MatchStrings(apiLanguageMatcher, acceptLanguage)
	if index == 1 {
		return m.Chinese
	}
	return m.English
}

// Error preserves the service error contract; HTTP presentation uses ForLanguage instead.
func (m LocalizedMessage) Error() string { return m.Chinese }

// Format applies the same business values to both translations.
func (m LocalizedMessage) Format(values ...any) LocalizedMessage {
	return LocalizedMessage{English: fmt.Sprintf(m.English, values...), Chinese: fmt.Sprintf(m.Chinese, values...)}
}

// User-facing validation, authentication, and response messages are bilingual at their source.
var (
	ErrUsernameLength      = LocalizedMessage{English: "Username must be between 3 and %d characters.", Chinese: "用户名长度必须在3-%d个字符之间"}
	ErrEmailInvalid        = LocalizedMessage{English: "Enter a valid email address.", Chinese: "邮箱格式不正确"}
	ErrEmailLength         = LocalizedMessage{English: "Email must be at most %d characters.", Chinese: "邮箱长度不能超过 %d 个字符"}
	ErrPasswordShort       = LocalizedMessage{English: "Password must be at least 6 characters.", Chinese: "密码长度不能少于6个字符"}
	ErrPasswordLong        = LocalizedMessage{English: "Password must be at most %d bytes.", Chinese: "密码长度不能超过 %d 个字节"}
	ErrAccountConflict     = LocalizedMessage{English: "Email or username is already in use.", Chinese: "邮箱或用户名已被使用"}
	ErrRegistration        = LocalizedMessage{English: "Registration failed. Please try again later.", Chinese: "注册失败，请稍后重试"}
	ErrCredentials         = LocalizedMessage{English: "Incorrect email or password.", Chinese: "邮箱或密码错误"}
	ErrAccountInactive     = LocalizedMessage{English: "This account is inactive.", Chinese: "账户已停用"}
	ErrAvatarLength        = LocalizedMessage{English: "Avatar URL must be at most %d characters.", Chinese: "头像地址长度不能超过 %d 个字符"}
	ErrNewPasswordShort    = LocalizedMessage{English: "New password must be at least 6 characters.", Chinese: "新密码长度不能少于6个字符"}
	ErrNewPasswordLong     = LocalizedMessage{English: "New password must be at most %d bytes.", Chinese: "新密码长度不能超过 %d 个字节"}
	ErrCurrentPassword     = LocalizedMessage{English: "Incorrect current password.", Chinese: "原密码错误"}
	ErrUnauthenticated     = LocalizedMessage{English: "Please log in.", Chinese: "用户未认证"}
	ErrSessionExpired      = LocalizedMessage{English: "Your session has expired. Please log in again.", Chinese: "Session已失效"}
	ErrInternal            = LocalizedMessage{English: "Internal server error.", Chinese: "服务器内部错误"}
	ErrRateLimit           = LocalizedMessage{English: "Too many requests. Please try again later.", Chinese: "操作过于频繁，请稍后再试"}
	ErrAdminRequired       = LocalizedMessage{English: "Platform administrator access is required.", Chinese: "仅平台管理员可执行此操作"}
	ErrPagination          = LocalizedMessage{English: "Page must be positive and page size must be between 1 and 100.", Chinese: "页码必须为正数，每页数量必须在 1–100 之间"}
	ErrUserStatus          = LocalizedMessage{English: "Account status must be active or disabled.", Chinese: "账号状态必须为启用或禁用"}
	ErrUserNotFound        = LocalizedMessage{English: "User not found.", Chinese: "用户不存在"}
	ErrAdminProtected      = LocalizedMessage{English: "Administrator accounts cannot be disabled here.", Chinese: "不能在这里禁用管理员账号"}
	ErrActiveUserMissing   = LocalizedMessage{English: "An active registered user is required.", Chinese: "请指定已注册且处于启用状态的用户"}
	MessageHealthy         = LocalizedMessage{English: "Service is healthy.", Chinese: "服务正常运行"}
	MessageRegistered      = LocalizedMessage{English: "Account created.", Chinese: "注册成功"}
	MessageLoggedIn        = LocalizedMessage{English: "Logged in.", Chinese: "登录成功"}
	MessageLoggedOut       = LocalizedMessage{English: "Logged out.", Chinese: "退出成功"}
	MessageLoaded          = LocalizedMessage{English: "Loaded.", Chinese: "获取成功"}
	MessageUpdated         = LocalizedMessage{English: "Updated.", Chinese: "更新成功"}
	MessagePasswordChanged = LocalizedMessage{English: "Password changed. Please log in again.", Chinese: "密码修改成功，请重新登录"}
)

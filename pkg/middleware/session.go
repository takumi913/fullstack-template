package middleware

import (
	"net/http"
	"time"

	"go-react-template/configs"
	"go-react-template/pkg/model"

	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo/v4"
)

// SessionMiddleware session中间件配置.
type SessionMiddleware struct {
	Store *sessions.CookieStore
}

// NewSessionMiddleware 创建session中间件实例.
func NewSessionMiddleware() *SessionMiddleware {
	// 使用Session secret作为session的密钥
	store := sessions.NewCookieStore([]byte(configs.AppConfig.Session.Secret))

	// 配置session选项
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   configs.AppConfig.Session.ExpireHour * 3600, // 转换为秒
		HttpOnly: true,
		Secure:   false, // 在开发环境中设为false，生产环境应设为true
		SameSite: http.SameSiteLaxMode,
	}

	return &SessionMiddleware{
		Store: store,
	}
}

// Session 创建session认证中间件函数.
func Session() echo.MiddlewareFunc {
	sessionMiddleware := NewSessionMiddleware()
	return sessionMiddleware.SessionAuth()
}

// OptionalSession 创建可选session认证中间件函数.
func OptionalSession() echo.MiddlewareFunc {
	sessionMiddleware := NewSessionMiddleware()
	return sessionMiddleware.OptionalSessionAuth()
}

// CreateSession 创建用户session.
func (s *SessionMiddleware) CreateSession(c echo.Context, user *model.User) error {
	session, err := s.Store.Get(c.Request(), "user-session")
	if err != nil {
		return err
	}

	// 设置session数据
	session.Values["user_id"] = user.ID
	session.Values["username"] = user.Username
	session.Values["email"] = user.Email
	session.Values["authenticated"] = true
	session.Values["created_at"] = time.Now().Unix()

	// 保存session
	return session.Save(c.Request(), c.Response())
}

// DestroySession 销毁用户session.
func (s *SessionMiddleware) DestroySession(c echo.Context) error {
	session, err := s.Store.Get(c.Request(), "user-session")
	if err != nil {
		return err
	}

	// 清空session数据
	session.Values = make(map[interface{}]interface{})
	session.Options.MaxAge = -1 // 立即过期

	// 保存session（实际上是删除）
	return session.Save(c.Request(), c.Response())
}

// SessionAuth session认证中间件.
func (s *SessionMiddleware) SessionAuth() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			session, err := s.Store.Get(c.Request(), "user-session")
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "无效的session")
			}

			// 检查用户是否已认证
			authenticated, ok := session.Values["authenticated"].(bool)
			if !ok || !authenticated {
				return echo.NewHTTPError(http.StatusUnauthorized, "用户未认证")
			}

			// 检查session中的用户信息
			userID, ok := session.Values["user_id"].(string)
			if !ok || userID == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "session中缺少用户信息")
			}

			username, _ := session.Values["username"].(string) //nolint:errcheck
			email, _ := session.Values["email"].(string)       //nolint:errcheck

			// 将用户信息存储到context中
			c.Set("user_id", userID)
			c.Set("username", username)
			c.Set("email", email)

			return next(c)
		}
	}
}

// OptionalSessionAuth 可选的session认证中间件（不强制要求认证）.
func (s *SessionMiddleware) OptionalSessionAuth() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			session, err := s.Store.Get(c.Request(), "user-session")
			if err == nil {
				// 检查用户是否已认证
				if authenticated, ok := session.Values["authenticated"].(bool); ok && authenticated {
					// 提取用户信息
					if userID, ok := session.Values["user_id"].(string); ok && userID != "" {
						username, _ := session.Values["username"].(string) //nolint:errcheck
						email, _ := session.Values["email"].(string)       //nolint:errcheck

						// 将用户信息存储到context中
						c.Set("user_id", userID)
						c.Set("username", username)
						c.Set("email", email)
						c.Set("is_anonymous", false)

						return next(c)
					}
				}
			}

			// 未登录用户，检查或创建匿名用户 ID
			anonSession, err := s.Store.Get(c.Request(), "anonymous-session")
			if err == nil {
				if anonID, ok := anonSession.Values["anonymous_id"].(string); ok && anonID != "" {
					c.Set("user_id", anonID)
					c.Set("is_anonymous", true)

					return next(c)
				}
			}

			// 创建新的匿名用户 ID
			anonID := "anon-" + uuid.New().String()
			anonSession.Values["anonymous_id"] = anonID
			anonSession.Options = &sessions.Options{
				Path:     "/",
				MaxAge:   365 * 24 * 3600, // 1年
				HttpOnly: true,
				Secure:   false,
				SameSite: http.SameSiteLaxMode,
			}

			_ = anonSession.Save(c.Request(), c.Response()) //nolint:errcheck

			c.Set("user_id", anonID)
			c.Set("is_anonymous", true)

			return next(c)
		}
	}
}

// RefreshSession 刷新session（延长过期时间）.
func (s *SessionMiddleware) RefreshSession(c echo.Context) error {
	session, err := s.Store.Get(c.Request(), "user-session")
	if err != nil {
		return err
	}

	// 检查用户是否已认证
	authenticated, ok := session.Values["authenticated"].(bool)
	if !ok || !authenticated {
		return echo.NewHTTPError(http.StatusUnauthorized, "用户未认证")
	}

	// 更新创建时间
	session.Values["created_at"] = time.Now().Unix()

	// 保存session
	return session.Save(c.Request(), c.Response())
}

// GetUserIDFromSession 从session中获取用户ID.
func GetUserIDFromSession(c echo.Context) string {
	userID := c.Get("user_id")
	if userID == nil {
		return ""
	}

	id, ok := userID.(string)
	if !ok {
		return ""
	}

	return id
}

// GetUsernameFromSession 从session中获取用户名.
func GetUsernameFromSession(c echo.Context) string {
	username := c.Get("username")
	if username == nil {
		return ""
	}

	name, ok := username.(string)
	if !ok {
		return ""
	}

	return name
}

// GetEmailFromSession 从session中获取邮箱.
func GetEmailFromSession(c echo.Context) string {
	email := c.Get("email")
	if email == nil {
		return ""
	}

	e, ok := email.(string)
	if !ok {
		return ""
	}

	return e
}

// ExtractUserIDFromSession 从session上下文中提取用户ID.
func ExtractUserIDFromSession(c echo.Context) (string, error) {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return "", echo.NewHTTPError(http.StatusUnauthorized, "用户ID未找到")
	}

	return userID, nil
}

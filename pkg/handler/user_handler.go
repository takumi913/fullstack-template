// Package handler HTTP处理层，负责解析HTTP请求并返回响应
package handler

import (
	"net/http"

	"go-react-template/pkg/middleware"
	"go-react-template/pkg/model"
	"go-react-template/pkg/service"

	"github.com/labstack/echo/v5"
)

// UserHandler 用户HTTP处理器.
type UserHandler struct {
	userService service.UserService
}

// NewUserHandler 创建用户HTTP处理器实例.
func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// POST /api/v1/auth/register.
func (h *UserHandler) Register(c *echo.Context) error {
	var req model.UserRegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	user, err := h.userService.Register(&req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    user,
		"message": "注册成功",
	})
}

// POST /api/v1/auth/login.
func (h *UserHandler) Login(c *echo.Context) error {
	var req model.UserLoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	loginResponse, err := h.userService.Login(&req)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	// 创建session
	sessionMiddleware := middleware.NewSessionMiddleware()
	user := &model.User{
		ID:       loginResponse.User.ID,
		Username: loginResponse.User.Username,
		Email:    loginResponse.User.Email,
	}

	if err := sessionMiddleware.CreateSession(c, user); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "创建session失败",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    loginResponse,
		"message": "登录成功",
	})
}

// GET /api/v1/user/profile/:id.
func (h *UserHandler) GetProfile(c *echo.Context) error {
	id := c.Param("id")

	user, err := h.userService.GetUserByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    user,
		"message": "获取成功",
	})
}

// POST /api/v1/auth/google.
func (h *UserHandler) GoogleLogin(c *echo.Context) error {
	var req model.GoogleLoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	loginResponse, err := h.userService.GoogleLogin(&req)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	// 创建session
	sessionMiddleware := middleware.NewSessionMiddleware()
	user := &model.User{
		ID:       loginResponse.User.ID,
		Username: loginResponse.User.Username,
		Email:    loginResponse.User.Email,
	}

	if err := sessionMiddleware.CreateSession(c, user); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "创建session失败",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    loginResponse,
		"message": "Google登录成功",
	})
}

// POST /api/v1/auth/logout.
func (h *UserHandler) Logout(c *echo.Context) error {
	// 销毁session
	sessionMiddleware := middleware.NewSessionMiddleware()
	if err := sessionMiddleware.DestroySession(c); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "注销失败",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    nil,
		"message": "注销成功",
	})
}

// PUT /api/v1/user/profile.
func (h *UserHandler) UpdateProfile(c *echo.Context) error {
	var req model.UserUpdateProfileRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "缺少用户ID参数",
		})
	}

	// 从session中获取用户ID
	userID, err := middleware.ExtractUserIDFromSession(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "未授权访问",
		})
	}

	user, err := h.userService.UpdateProfile(userID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    user,
		"message": "更新成功",
	})
}

// POST /api/v1/user/change-password.
func (h *UserHandler) ChangePassword(c *echo.Context) error {
	var req model.UserChangePasswordRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	// 从session中获取用户ID
	userID, err := middleware.ExtractUserIDFromSession(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "未授权访问",
		})
	}

	err = h.userService.ChangePassword(userID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    nil,
		"message": "密码修改成功",
	})
}

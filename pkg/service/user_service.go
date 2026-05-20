// Package service 业务逻辑层，处理核心业务逻辑
package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"go-react-template/pkg/middleware"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"

	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/idtoken"
)

// UserService 用户业务逻辑接口.
type UserService interface {
	Register(req *model.UserRegisterRequest) (*model.UserResponse, error)
	Login(req *model.UserLoginRequest) (*LoginResponse, error)
	GoogleLogin(req *model.GoogleLoginRequest) (*LoginResponse, error)
	UpdateProfile(userID string, req *model.UserUpdateProfileRequest) (*model.UserResponse, error)
	GetUserByID(id string) (*model.UserResponse, error)
	ChangePassword(userID string, req *model.UserChangePasswordRequest) error
}

// LoginResponse 登录响应结构.
type LoginResponse struct {
	User *model.UserResponse `json:"user"`
}

// userService 用户业务逻辑实现.
type userService struct {
	userRepo          repo.UserRepo
	sessionMiddleware *middleware.SessionMiddleware
}

// NewUserService 创建用户业务逻辑实例.
func NewUserService(userRepo repo.UserRepo) UserService {
	return &userService{
		userRepo:          userRepo,
		sessionMiddleware: middleware.NewSessionMiddleware(),
	}
}

// Register 用户注册.
func (s *userService) Register(req *model.UserRegisterRequest) (*model.UserResponse, error) {
	// 验证输入
	if err := s.validateRegisterRequest(req); err != nil {
		return nil, err
	}

	// 检查邮箱是否已存在
	if _, err := s.userRepo.GetByEmail(req.Email); err == nil {
		return nil, errors.New("邮箱已被注册")
	}

	// 检查用户名是否已存在
	if _, err := s.userRepo.GetByUsername(req.Username); err == nil {
		return nil, errors.New("用户名已被使用")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("密码加密失败")
	}

	// 创建用户
	user := &model.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("用户创建失败: %v", err)
	}

	response := user.ToResponse()

	return &response, nil
}

// Login 用户登录.
func (s *userService) Login(req *model.UserLoginRequest) (*LoginResponse, error) {
	// 验证输入
	if err := s.validateLoginRequest(req); err != nil {
		return nil, err
	}

	// 根据邮箱获取用户
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, errors.New("邮箱或密码错误")
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("邮箱或密码错误")
	}

	// 检查用户是否被封禁
	if user.IsBanned {
		return nil, errors.New("账户已被封禁")
	}

	response := user.ToResponse()

	return &LoginResponse{
		User: &response,
	}, nil
}

// GetUserByID 根据ID获取用户信息.
func (s *userService) GetUserByID(id string) (*model.UserResponse, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	response := user.ToResponse()

	return &response, nil
}

// validateRegisterRequest 验证注册请求.
func (s *userService) validateRegisterRequest(req *model.UserRegisterRequest) error {
	if req.Username == "" {
		return errors.New("用户名不能为空")
	}

	if len(req.Username) < 3 || len(req.Username) > 50 {
		return errors.New("用户名长度必须在3-50个字符之间")
	}

	if req.Email == "" {
		return errors.New("邮箱不能为空")
	}

	if !strings.Contains(req.Email, "@") {
		return errors.New("邮箱格式不正确")
	}

	if req.Password == "" {
		return errors.New("密码不能为空")
	}

	if len(req.Password) < 6 {
		return errors.New("密码长度不能少于6个字符")
	}

	return nil
}

// validateLoginRequest 验证登录请求.
func (s *userService) validateLoginRequest(req *model.UserLoginRequest) error {
	if req.Email == "" {
		return errors.New("邮箱不能为空")
	}

	if !strings.Contains(req.Email, "@") {
		return errors.New("邮箱格式不正确")
	}

	if req.Password == "" {
		return errors.New("密码不能为空")
	}

	return nil
}

// GoogleLogin Google第三方登录.
func (s *userService) GoogleLogin(req *model.GoogleLoginRequest) (*LoginResponse, error) {
	// 验证输入
	if req.IDToken == "" {
		return nil, errors.New("google ID Token不能为空")
	}

	// 验证Google ID Token
	payload, err := idtoken.Validate(context.Background(), req.IDToken, "")
	if err != nil {
		return nil, fmt.Errorf("google ID Token验证失败: %v", err)
	}

	// 从payload中提取用户信息
	googleID := payload.Subject
	email, _ := payload.Claims["email"].(string)     //nolint:errcheck
	name, _ := payload.Claims["name"].(string)       //nolint:errcheck
	picture, _ := payload.Claims["picture"].(string) //nolint:errcheck

	if email == "" {
		return nil, errors.New("无法获取Google账户邮箱")
	}

	// 检查是否已存在Google用户
	user, err := s.userRepo.GetByGoogleID(googleID)
	if err == nil {
		// 检查用户是否被封禁
		if user.IsBanned {
			return nil, errors.New("账户已被封禁")
		}
		// 用户已存在，直接登录
		response := user.ToResponse()

		return &LoginResponse{
			User: &response,
		}, nil
	}

	// 检查邮箱是否已被本地用户使用
	existingUser, err := s.userRepo.GetByEmail(email)
	if err == nil {
		// 邮箱已存在，但不是Google用户，需要绑定
		if existingUser.LoginType == model.LoginTypeLocal {
			return nil, errors.New("该邮箱已被注册，请使用密码登录或联系管理员")
		}
	}

	// 创建新的Google用户
	username := name
	if username == "" {
		// 如果没有名字，使用邮箱前缀作为用户名
		username = strings.Split(email, "@")[0]
	}

	// 确保用户名唯一
	originalUsername := username
	counter := 1

	for {
		if _, err := s.userRepo.GetByUsername(username); err != nil {
			// 用户名不存在，可以使用
			break
		}
		// 用户名已存在，添加数字后缀
		username = fmt.Sprintf("%s%d", originalUsername, counter)
		counter++
	}

	// 创建新用户
	newUser := &model.User{
		Username:  username,
		Email:     email,
		AvatarURL: picture,
		GoogleID:  &googleID,
		LoginType: model.LoginTypeGoogle,
		// Google用户不需要密码
	}

	if err := s.userRepo.Create(newUser); err != nil {
		return nil, errors.New("用户创建失败")
	}

	response := newUser.ToResponse()

	return &LoginResponse{
		User: &response,
	}, nil
}

// ChangePassword 更改用户密码.
func (s *userService) ChangePassword(userID string, req *model.UserChangePasswordRequest) error {
	// 验证输入
	if err := s.validateChangePasswordRequest(req); err != nil {
		return err
	}

	// 获取当前用户
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return errors.New("用户不存在")
	}

	// 验证旧密码
	if errCompare := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); errCompare != nil {
		return errors.New("旧密码错误")
	}

	// 加密新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("密码加密失败")
	}

	// 更新密码
	user.Password = string(hashedPassword)
	if err := s.userRepo.Update(user); err != nil {
		return errors.New("密码更新失败")
	}

	return nil
}

// validateChangePasswordRequest 验证更改密码请求.
func (s *userService) validateChangePasswordRequest(req *model.UserChangePasswordRequest) error {
	if req.OldPassword == "" {
		return errors.New("旧密码不能为空")
	}

	if req.NewPassword == "" {
		return errors.New("新密码不能为空")
	}

	if len(req.NewPassword) < 6 {
		return errors.New("新密码长度不能少于6个字符")
	}

	if req.OldPassword == req.NewPassword {
		return errors.New("新密码不能与旧密码相同")
	}

	return nil
}

// UpdateProfile 更新用户个人资料.
func (s *userService) UpdateProfile(userID string, req *model.UserUpdateProfileRequest) (*model.UserResponse, error) {
	// 验证输入
	if err := s.validateUpdateProfileRequest(req); err != nil {
		return nil, err
	}

	// 获取当前用户
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	// 如果要更新用户名，检查是否已被使用
	if req.Username != "" && req.Username != user.Username {
		if _, err := s.userRepo.GetByUsername(req.Username); err == nil {
			return nil, errors.New("用户名已被使用")
		}

		user.Username = req.Username
	}

	// 如果要更新邮箱，检查是否已被使用
	if req.Email != "" && req.Email != user.Email {
		if _, err := s.userRepo.GetByEmail(req.Email); err == nil {
			return nil, errors.New("邮箱已被注册")
		}

		user.Email = req.Email
	}

	// 更新其他字段
	if req.Bio != "" {
		user.Bio = req.Bio
	}

	// 保存更新
	if err := s.userRepo.Update(user); err != nil {
		return nil, errors.New("更新失败")
	}

	response := user.ToResponse()

	return &response, nil
}

// validateUpdateProfileRequest 验证更新个人资料请求.
func (s *userService) validateUpdateProfileRequest(req *model.UserUpdateProfileRequest) error {
	if req.Username != "" {
		if len(req.Username) < 3 || len(req.Username) > 50 {
			return errors.New("用户名长度必须在3-50个字符之间")
		}
	}

	if req.Email != "" {
		if !strings.Contains(req.Email, "@") {
			return errors.New("邮箱格式不正确")
		}
	}

	if req.Bio != "" {
		if len(req.Bio) > 500 {
			return errors.New("个人简介不能超过500个字符")
		}
	}

	return nil
}

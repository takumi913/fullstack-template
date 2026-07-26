package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"go-react-template/configs"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct{ store *repo.Store }

func NewAuthService(store *repo.Store) *AuthService { return &AuthService{store: store} }
func validateCredentials(username, email, password string) error {
	username = strings.TrimSpace(username)
	email = strings.TrimSpace(strings.ToLower(email))
	if username != "" && (len(username) < 3 || len(username) > 50) {
		return errors.New("用户名长度必须在3-50个字符之间")
	}
	if email == "" || !strings.Contains(email, "@") {
		return errors.New("邮箱格式不正确")
	}
	if len(password) < 6 {
		return errors.New("密码长度不能少于6个字符")
	}
	return nil
}
func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var b strings.Builder
	lastDash := false
	for _, r := range value {
		ok := r >= 'a' && r <= 'z' || r >= '0' && r <= '9'
		if ok {
			b.WriteRune(r)
			lastDash = false
		} else if !lastDash && b.Len() > 0 {
			b.WriteByte('-')
			lastDash = true
		}
	}
	return strings.Trim(b.String(), "-")
}
func (s *AuthService) Register(ctx context.Context, req model.RegisterRequest) (*model.AuthResponse, string, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Username = strings.TrimSpace(req.Username)
	if err := validateCredentials(req.Username, req.Email, req.Password); err != nil {
		return nil, "", err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}
	user := &model.User{ID: uuid.NewString(), Username: req.Username, Email: req.Email, PasswordHash: string(hash), Status: model.UserStatusActive}
	tenant := &model.Tenant{ID: uuid.NewString(), Name: req.Username + "'s Workspace", Slug: slugify(req.Username) + "-" + uuid.NewString()[:8], CreatedBy: user.ID}
	member := &model.TenantMember{ID: uuid.NewString(), TenantID: tenant.ID, UserID: user.ID, Role: model.TenantRoleOwner}
	err = s.store.WithTx(ctx, func(tx *repo.Store) error {
		if e := tx.CreateUser(ctx, user); e != nil {
			return e
		}
		if e := tx.CreateTenant(ctx, tenant); e != nil {
			return e
		}
		return tx.CreateMember(ctx, member)
	})
	if err != nil {
		if errors.Is(err, repo.ErrConflict) {
			return nil, "", errors.New("邮箱或用户名已被使用")
		}
		// 原始错误只记日志：它会被当作 400 返回，绕过 handler 层的 5xx 脱敏。
		slog.Error("注册失败", "error", err)
		return nil, "", errors.New("注册失败，请稍后重试")
	}
	user, err = s.store.GetUserByID(ctx, user.ID)
	if err != nil {
		return nil, "", err
	}
	tenant, err = s.store.GetTenantByID(ctx, tenant.ID)
	if err != nil {
		return nil, "", err
	}
	token, err := s.createSession(ctx, user.ID, &tenant.ID)
	if err != nil {
		return nil, "", err
	}
	return &model.AuthResponse{User: user.ToResponse(), Tenants: []model.Tenant{*tenant}, ActiveTenantID: &tenant.ID}, token, nil
}
func (s *AuthService) Login(ctx context.Context, req model.LoginRequest) (*model.AuthResponse, string, error) {
	user, err := s.store.GetUserByEmail(ctx, strings.ToLower(strings.TrimSpace(req.Email)))
	if err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		return nil, "", errors.New("邮箱或密码错误")
	}
	if user.Status != model.UserStatusActive {
		return nil, "", errors.New("账户已停用")
	}
	tenants, err := s.store.ListTenants(ctx, user.ID)
	if err != nil {
		return nil, "", err
	}
	var active *string
	if len(tenants) > 0 {
		active = &tenants[0].ID
	}
	token, err := s.createSession(ctx, user.ID, active)
	if err != nil {
		return nil, "", err
	}
	return &model.AuthResponse{User: user.ToResponse(), Tenants: tenants, ActiveTenantID: active}, token, nil
}
func (s *AuthService) createSession(ctx context.Context, userID string, active *string) (string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	token := hex.EncodeToString(raw)
	sum := sha256.Sum256([]byte(token))
	v := &model.Session{ID: uuid.NewString(), UserID: userID, TokenHash: hex.EncodeToString(sum[:]), ActiveTenantID: active, ExpiresAt: time.Now().UTC().Add(time.Duration(configs.AppConfig.Session.ExpireHour) * time.Hour)}
	if err := s.store.CreateSession(ctx, v); err != nil {
		return "", err
	}
	return token, nil
}
func TokenHash(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
func (s *AuthService) Session(ctx context.Context, token string) (*model.AuthResponse, *model.Session, error) {
	session, err := s.store.GetSession(ctx, TokenHash(token))
	if err != nil {
		return nil, nil, err
	}
	user, err := s.store.GetUserByID(ctx, session.UserID)
	if err != nil || user.Status != model.UserStatusActive {
		return nil, nil, repo.ErrNotFound
	}
	tenants, err := s.store.ListTenants(ctx, user.ID)
	if err != nil {
		return nil, nil, err
	}
	return &model.AuthResponse{User: user.ToResponse(), Tenants: tenants, ActiveTenantID: session.ActiveTenantID}, session, nil
}
func (s *AuthService) Logout(ctx context.Context, token string) error {
	v, err := s.store.GetSession(ctx, TokenHash(token))
	if err != nil {
		return nil
	}
	return s.store.DeleteSession(ctx, v.ID)
}

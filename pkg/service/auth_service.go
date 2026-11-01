package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fullstack-template/configs"
	"fullstack-template/pkg/model"
	"fullstack-template/pkg/repo"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// 用于在邮箱不存在时消耗与真实校验相当的时间，避免暴露账号是否存在。
var dummyPasswordHash = func() []byte {
	h, err := bcrypt.GenerateFromPassword([]byte("dummy-password-for-timing"), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	return h
}()

type AuthService struct{ store *repo.Store }

func NewAuthService(store *repo.Store) *AuthService { return &AuthService{store: store} }

// 长度上限对齐 PostgreSQL schema 中最窄的列定义。
// SQLite 的 TEXT 没有长度限制，不在此处校验会导致同一份输入在两种数据库上行为不同：
// SQLite 静默写入，PostgreSQL 报驱动错误。
const (
	maxUsernameLen  = 50
	maxEmailLen     = 255
	maxAvatarURLLen = 500
	// bcrypt 只处理前 72 字节，超出会直接返回错误。
	maxPasswordLen = 72
)

func validateUsername(username string) error {
	if len(username) < 3 || len(username) > maxUsernameLen {
		return model.ErrUsernameLength.Format(maxUsernameLen)
	}
	return nil
}

func validateEmail(email string) error {
	if email == "" || !strings.Contains(email, "@") {
		return model.ErrEmailInvalid
	}
	if len(email) > maxEmailLen {
		return model.ErrEmailLength.Format(maxEmailLen)
	}
	return nil
}

func validateRegistration(email, password string) error {
	if err := validateEmail(email); err != nil {
		return err
	}
	if len(password) < 6 {
		return model.ErrPasswordShort
	}
	if len(password) > maxPasswordLen {
		return model.ErrPasswordLong.Format(maxPasswordLen)
	}
	return nil
}

// emailLabel 取出与邮箱相关、可放进用户名的稳定片段。
// 优先用本地部分（去掉 + 别名）；规整后为空再退回域名，避免生成与邮箱无关的占位名。
func emailLabel(email string) string {
	local := email
	if i := strings.IndexByte(email, '@'); i >= 0 {
		local = email[:i]
	}
	if i := strings.IndexByte(local, '+'); i > 0 {
		local = local[:i]
	}
	if base := slugify(local); base != "" {
		return base
	}
	if i := strings.IndexByte(email, '@'); i >= 0 && i+1 < len(email) {
		if base := slugify(email[i+1:]); base != "" {
			return base
		}
	}
	return "user"
}

func trimLabel(label string, limit int) string {
	if len(label) > limit {
		label = strings.TrimRight(label[:limit], "-")
	}
	if label == "" {
		return "user"
	}
	return label
}

func randomHex(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// usernameFromLabel 用邮箱片段加随机后缀占住 users.username 的唯一索引。
// 同一本地部分可以重复注册，不能把空用户名或纯本地部分写进唯一列。
func usernameFromLabel(label string) (string, error) {
	suffix, err := randomHex(4)
	if err != nil {
		return "", err
	}
	return trimLabel(label, maxUsernameLen-len(suffix)-1) + "-" + suffix, nil
}

func (s *AuthService) emailTaken(ctx context.Context, email string) (bool, error) {
	_, err := s.store.GetUserByEmail(ctx, email)
	if err == nil {
		return true, nil
	}
	if errors.Is(err, repo.ErrNotFound) {
		return false, nil
	}
	return false, err
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
	if err := validateRegistration(req.Email, req.Password); err != nil {
		return nil, "", err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}
	if err := s.ensureEmailAvailable(ctx, req.Email); err != nil {
		return nil, "", err
	}
	user, err := s.createRegisteredUser(ctx, req.Email, string(hash), emailLabel(req.Email))
	if err != nil {
		return nil, "", err
	}
	token, err := s.createSession(ctx, user.ID)
	if err != nil {
		return nil, "", err
	}
	return &model.AuthResponse{User: user.ToResponse()}, token, nil
}

func (s *AuthService) ensureEmailAvailable(ctx context.Context, email string) error {
	taken, err := s.emailTaken(ctx, email)
	if err != nil {
		return registrationFailed(err)
	}
	if taken {
		return model.ErrAccountConflict
	}
	return nil
}

// registrationFailed 把驱动错误留在日志里。Register 的失败会按 400 返回，不能把原始错误交给 handler。
func registrationFailed(err error) error {
	slog.Error("注册失败", "error", err)
	return model.ErrRegistration
}

func (s *AuthService) createRegisteredUser(ctx context.Context, email, hash, label string) (*model.User, error) {
	var lastErr error
	// 后缀碰撞（含已软删除账号仍占用唯一索引）时换一个用户名重试。邮箱冲突不是重试能解决的。
	for range 5 {
		username, err := usernameFromLabel(label)
		if err != nil {
			return nil, err
		}
		user := &model.User{ID: uuid.NewString(), Username: username, Email: email, PasswordHash: hash, Status: model.UserStatusActive}
		err = s.store.CreateUser(ctx, user)
		if err == nil {
			return s.store.GetUserByID(ctx, user.ID)
		}
		if !errors.Is(err, repo.ErrConflict) {
			return nil, registrationFailed(err)
		}
		if err := s.ensureEmailAvailable(ctx, email); err != nil {
			return nil, err
		}
		lastErr = err
	}
	return nil, registrationFailed(lastErr)
}
func (s *AuthService) Login(ctx context.Context, req model.LoginRequest) (*model.AuthResponse, string, error) {
	user, err := s.store.GetUserByEmail(ctx, strings.ToLower(strings.TrimSpace(req.Email)))
	if err != nil {
		// 邮箱不存在时也要跑一次 bcrypt：否则响应耗时相差数万倍，
		// 攻击者可据此判断某个邮箱是否已注册。结果必然不匹配，无需检查。
		if err := bcrypt.CompareHashAndPassword(dummyPasswordHash, []byte(req.Password)); err != nil {
			_ = err
		}
		return nil, "", model.ErrCredentials
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		return nil, "", model.ErrCredentials
	}
	if user.Status != model.UserStatusActive {
		return nil, "", model.ErrAccountInactive
	}
	token, err := s.createSession(ctx, user.ID)
	if err != nil {
		return nil, "", err
	}
	return &model.AuthResponse{User: user.ToResponse()}, token, nil
}
func (s *AuthService) createSession(ctx context.Context, userID string) (string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	token := hex.EncodeToString(raw)
	sum := sha256.Sum256([]byte(token))
	v := &model.Session{ID: uuid.NewString(), UserID: userID, TokenHash: hex.EncodeToString(sum[:]), ExpiresAt: time.Now().UTC().Add(time.Duration(configs.AppConfig.Session.ExpireHour) * time.Hour)}
	if err := s.store.CreateSession(ctx, v); err != nil {
		if errors.Is(err, repo.ErrNotFound) {
			return "", model.ErrAccountInactive
		}
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
	return &model.AuthResponse{User: user.ToResponse()}, session, nil
}
func (s *AuthService) Logout(ctx context.Context, token string) error {
	v, err := s.store.GetSession(ctx, TokenHash(token))
	if err != nil {
		return nil
	}
	return s.store.DeleteSession(ctx, v.ID)
}

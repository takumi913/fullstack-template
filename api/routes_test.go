package api_test

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"fullstack-template/api"
	"fullstack-template/configs"
	"fullstack-template/db/migrations"
	"fullstack-template/pkg/handler"
	"fullstack-template/pkg/middleware"
	"fullstack-template/pkg/model"
	"fullstack-template/pkg/repo"
	"fullstack-template/pkg/service"

	"github.com/labstack/echo/v5"
	_ "modernc.org/sqlite"
)

// 这些用例走完整的 HTTP 栈，覆盖认证边界和语言选择。
func newTestServer(t *testing.T) *echo.Echo {
	t.Helper()
	e, _ := newTestServerWithStore(t)
	return e
}

func newTestServerWithStore(t *testing.T) (*echo.Echo, *repo.Store) {
	t.Helper()
	configs.AppConfig = &configs.Config{Session: configs.SessionConfig{ExpireHour: 24}}
	db, err := sql.Open("sqlite", "file:"+t.TempDir()+"/api.db?_pragma=foreign_keys(1)")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	if err := migrations.Up(context.Background(), db, "sqlite"); err != nil {
		t.Fatal(err)
	}
	store := repo.NewStore(db, "sqlite")
	handlers := api.Handlers{
		Auth:  handler.NewAuthHandler(service.NewAuthService(store)),
		User:  handler.NewUserHandler(service.NewUserService(store)),
		Admin: handler.NewAdminHandler(service.NewAdminService(store)),
	}
	e := echo.New()
	api.SetupRoutes(e, handlers, middleware.NewAuthMiddleware(service.NewAuthService(store)))
	return e, store
}

func do(t *testing.T, e *echo.Echo, method, path, token, body string) (int, string) {
	t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	if token != "" {
		req.AddCookie(&http.Cookie{Name: middleware.SessionCookie, Value: token})
	}
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	return rec.Code, rec.Body.String()
}

func register(t *testing.T, e *echo.Echo, email string) (token, username string) {
	t.Helper()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register",
		strings.NewReader(`{"email":"`+email+`","password":"secret12"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("注册失败: %d %s", rec.Code, rec.Body.String())
	}
	var payload struct {
		Data struct {
			User struct {
				Username string `json:"username"`
			} `json:"user"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	for _, c := range rec.Result().Cookies() {
		if c.Name == middleware.SessionCookie {
			token = c.Value
		}
	}
	if token == "" {
		t.Fatal("注册响应未设置会话 Cookie")
	}
	return token, payload.Data.User.Username
}

func TestRegisterDoesNotRequireUsername(t *testing.T) {
	e := newTestServer(t)
	_, username := register(t, e, "ada@example.com")
	if !strings.HasPrefix(username, "ada-") {
		t.Fatalf("username = %q", username)
	}
	status, body := do(t, e, http.MethodPost, "/api/v1/auth/register", "", `{"username":"chosen","email":"grace@example.com","password":"secret12"}`)
	var payload struct{ Data model.AuthResponse }
	if err := json.Unmarshal([]byte(body), &payload); err != nil {
		t.Fatal(err)
	}
	if status != http.StatusOK || !strings.HasPrefix(payload.Data.User.Username, "grace-") {
		t.Fatalf("registration with legacy username = %d %s", status, body)
	}
	status, body = do(t, e, http.MethodPost, "/api/v1/auth/register", "", `{"email":"ada@example.com","password":"secret12"}`)
	if status != http.StatusBadRequest || !strings.Contains(body, "already in use") && !strings.Contains(body, "已被使用") {
		t.Fatalf("duplicate email = %d %s", status, body)
	}
}

func TestPrivateRoutesRequireSession(t *testing.T) {
	e := newTestServer(t)
	for _, path := range []string{"/api/v1/user/profile", "/api/v1/auth/session", "/api/v1/admin/users"} {
		if status, body := do(t, e, http.MethodGet, path, "", ""); status != http.StatusUnauthorized {
			t.Errorf("%s 未登录应返回 401，实际 %d %s", path, status, body)
		}
	}
	if status, _ := do(t, e, http.MethodGet, "/api/v1/user/profile", "not-a-real-token", ""); status != http.StatusUnauthorized {
		t.Errorf("伪造 token 应返回 401，实际 %d", status)
	}
}

func TestPlatformAdminPrivilegesAreExplicit(t *testing.T) {
	e, store := newTestServerWithStore(t)
	ctx := context.Background()
	token, _ := register(t, e, "operator@example.com")
	user, err := store.GetUserByEmail(ctx, "operator@example.com")
	if err != nil {
		t.Fatal(err)
	}
	if user.IsAdmin {
		t.Fatal("first registered account unexpectedly became administrator")
	}
	for _, method := range []string{http.MethodGet, http.MethodPatch} {
		path := "/api/v1/admin/users"
		if method == http.MethodPatch {
			path += "/" + user.ID
		}
		if status, _ := do(t, e, method, path, token, `{"status":"disabled"}`); status != http.StatusForbidden {
			t.Fatalf("ordinary account %s %s status = %d", method, path, status)
		}
	}
	status, body := do(t, e, http.MethodPatch, "/api/v1/user/profile", token, `{"is_admin":true,"status":"disabled"}`)
	var profile struct{ Data model.UserResponse }
	if err := json.Unmarshal([]byte(body), &profile); err != nil {
		t.Fatal(err)
	}
	if status != http.StatusOK || profile.Data.IsAdmin || profile.Data.Status != model.UserStatusActive {
		t.Fatalf("profile update changed privileged fields = %d %s", status, body)
	}
	status, body = do(t, e, http.MethodPost, "/api/v1/auth/register", "", `{"email":"forged@example.com","password":"secret12","is_admin":true}`)
	var registration struct{ Data model.AuthResponse }
	if err := json.Unmarshal([]byte(body), &registration); err != nil {
		t.Fatal(err)
	}
	if status != http.StatusOK || registration.Data.User.IsAdmin {
		t.Fatalf("registration privilege injection = %d %s", status, body)
	}
	if err := service.NewAdminService(store).Grant(ctx, user.ID); err != nil {
		t.Fatal(err)
	}
	status, body = do(t, e, http.MethodGet, "/api/v1/admin/users?query=operator&page_size=1", token, "")
	var list struct{ Data model.UserListResponse }
	if err := json.Unmarshal([]byte(body), &list); err != nil {
		t.Fatal(err)
	}
	if status != http.StatusOK || len(list.Data.Items) != 1 || list.Data.Items[0].ID != user.ID || !list.Data.Items[0].IsAdmin || list.Data.Pagination.Total != 1 {
		t.Fatalf("new privilege on existing session = %d %s", status, body)
	}
	if strings.Contains(body, "password_hash") || strings.Contains(body, "token_hash") {
		t.Fatal("user list exposed credentials")
	}
	for _, tc := range []struct {
		method, path, body string
		want               int
	}{
		{http.MethodPatch, "/api/v1/admin/users/" + user.ID, `{"status":"disabled"}`, http.StatusForbidden},
		{http.MethodPatch, "/api/v1/admin/users/missing", `{"status":"disabled"}`, http.StatusNotFound},
		{http.MethodPatch, "/api/v1/admin/users/" + user.ID, `{"status":"invalid"}`, http.StatusBadRequest},
		{http.MethodGet, "/api/v1/admin/users?page_size=101", "", http.StatusBadRequest},
	} {
		if got, body := do(t, e, tc.method, tc.path, token, tc.body); got != tc.want {
			t.Errorf("%s %s = %d %s, want %d", tc.method, tc.path, got, body, tc.want)
		}
	}
}

func TestAdminDisablingAccountRevokesItsSessions(t *testing.T) {
	e, store := newTestServerWithStore(t)
	ctx := context.Background()
	adminToken, _ := register(t, e, "operator@example.com")
	userToken, _ := register(t, e, "alice@example.com")
	admin, err := store.GetUserByEmail(ctx, "operator@example.com")
	if err != nil {
		t.Fatal(err)
	}
	user, err := store.GetUserByEmail(ctx, "alice@example.com")
	if err != nil {
		t.Fatal(err)
	}
	adminService := service.NewAdminService(store)
	if err := adminService.Grant(ctx, admin.ID); err != nil {
		t.Fatal(err)
	}
	path := "/api/v1/admin/users/" + user.ID
	if status, body := do(t, e, http.MethodPatch, path, adminToken, `{"status":"disabled"}`); status != http.StatusOK {
		t.Fatalf("disable = %d %s", status, body)
	}
	if status, _ := do(t, e, http.MethodGet, "/api/v1/auth/session", userToken, ""); status != http.StatusUnauthorized {
		t.Fatalf("disabled session status = %d", status)
	}
	if status, _ := do(t, e, http.MethodPost, "/api/v1/auth/login", "", `{"email":"alice@example.com","password":"secret12"}`); status != http.StatusUnauthorized {
		t.Fatalf("disabled login status = %d", status)
	}
	if err := adminService.Grant(ctx, user.ID); !errors.Is(err, model.ErrActiveUserMissing) {
		t.Fatalf("grant to disabled account error = %v", err)
	}
	if status, body := do(t, e, http.MethodPatch, path, adminToken, `{"status":"active"}`); status != http.StatusOK {
		t.Fatalf("enable = %d %s", status, body)
	}
	if status, _ := do(t, e, http.MethodGet, "/api/v1/auth/session", userToken, ""); status != http.StatusUnauthorized {
		t.Fatalf("enabling restored a revoked session, status = %d", status)
	}
	if status, body := do(t, e, http.MethodPost, "/api/v1/auth/login", "", `{"email":"alice@example.com","password":"secret12"}`); status != http.StatusOK {
		t.Fatalf("new login after enabling = %d %s", status, body)
	}
}

func TestPersonalAccountsRemainIndependent(t *testing.T) {
	e := newTestServer(t)
	aliceToken, _ := register(t, e, "alice@example.com")
	bobToken, bobUsername := register(t, e, "bob@example.com")
	if status, body := do(t, e, http.MethodPatch, "/api/v1/user/profile", aliceToken, `{"username":"alice-updated"}`); status != http.StatusOK {
		t.Fatalf("update own profile = %d %s", status, body)
	}
	for _, tc := range []struct{ token, email, username string }{
		{aliceToken, "alice@example.com", "alice-updated"},
		{bobToken, "bob@example.com", bobUsername},
	} {
		status, body := do(t, e, http.MethodGet, "/api/v1/user/profile", tc.token, "")
		var payload struct{ Data model.UserResponse }
		if err := json.Unmarshal([]byte(body), &payload); err != nil {
			t.Fatal(err)
		}
		if status != http.StatusOK || payload.Data.Email != tc.email || payload.Data.Username != tc.username {
			t.Fatalf("profile for %s = %d %s", tc.email, status, body)
		}
	}
	if status, body := do(t, e, http.MethodPost, "/api/v1/auth/logout", aliceToken, ""); status != http.StatusOK {
		t.Fatalf("logout = %d %s", status, body)
	}
	if status, _ := do(t, e, http.MethodGet, "/api/v1/auth/session", aliceToken, ""); status != http.StatusUnauthorized {
		t.Fatalf("logged out session status = %d", status)
	}
	status, body := do(t, e, http.MethodGet, "/api/v1/auth/session", bobToken, "")
	var payload struct{ Data model.AuthResponse }
	if err := json.Unmarshal([]byte(body), &payload); err != nil {
		t.Fatal(err)
	}
	if status != http.StatusOK || payload.Data.User.Email != "bob@example.com" {
		t.Fatalf("other account session after logout = %d %s", status, body)
	}
	status, body = do(t, e, http.MethodPost, "/api/v1/auth/login", "", `{"email":"alice@example.com","password":"secret12"}`)
	if err := json.Unmarshal([]byte(body), &payload); err != nil {
		t.Fatal(err)
	}
	if status != http.StatusOK || payload.Data.User.Email != "alice@example.com" || payload.Data.User.Username != "alice-updated" {
		t.Fatalf("login after profile update = %d %s", status, body)
	}
	for _, path := range []string{"/api/v1/tenants", "/api/v1/tenants/removed/members"} {
		if status, _ := do(t, e, http.MethodGet, path, bobToken, ""); status != http.StatusNotFound {
			t.Errorf("removed endpoint %s status = %d", path, status)
		}
	}
}

func TestAPILocalizedMessages(t *testing.T) {
	e := newTestServer(t)
	token, _ := register(t, e, "ada@example.com")
	for _, tc := range []struct{ language, want string }{
		{"", "Username must be between 3 and 50 characters."},
		{"en", "Username must be between 3 and 50 characters."},
		{"zh-CN", "用户名长度必须在3-50个字符之间"},
		{"en;q=0.9,zh-CN;q=0.5", "Username must be between 3 and 50 characters."},
		{"fr", "Username must be between 3 and 50 characters."},
	} {
		t.Run(tc.language, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPatch, "/api/v1/user/profile", strings.NewReader(`{"username":"a"}`))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			req.Header.Set("Accept-Language", tc.language)
			req.AddCookie(&http.Cookie{Name: middleware.SessionCookie, Value: token})
			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)
			var payload struct {
				Code    int
				Message string
			}
			if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
				t.Fatal(err)
			}
			if rec.Code != http.StatusBadRequest || payload.Code != 1 || payload.Message != tc.want {
				t.Fatalf("response = %d %s, want 400 localized validation %q", rec.Code, rec.Body.String(), tc.want)
			}
		})
	}
	for _, tc := range []struct{ language, want string }{{"en", "Please log in."}, {"zh-CN", "用户未认证"}} {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/session", nil)
		req.Header.Set("Accept-Language", tc.language)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)
		if rec.Code != http.StatusUnauthorized || !strings.Contains(rec.Body.String(), tc.want) {
			t.Fatalf("authentication language %s: %d %s", tc.language, rec.Code, rec.Body.String())
		}
	}
}

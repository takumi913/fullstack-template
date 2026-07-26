package api_test

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"go-react-template/api"
	"go-react-template/configs"
	"go-react-template/db/migrations"
	"go-react-template/pkg/handler"
	"go-react-template/pkg/middleware"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
	"go-react-template/pkg/service"

	"github.com/labstack/echo/v5"
	_ "modernc.org/sqlite"
)

// 这些用例走完整的 HTTP 栈（路由 → 中间件 → handler → service → repo），
// 覆盖仅靠 service 层测试无法验证的权限矩阵和认证边界。
func newTestServer(t *testing.T) *echo.Echo {
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
		Auth:   handler.NewAuthHandler(service.NewAuthService(store)),
		User:   handler.NewUserHandler(service.NewUserService(store)),
		Tenant: handler.NewTenantHandler(service.NewTenantService(store)),
		Member: handler.NewMemberHandler(service.NewMemberService(store)),
	}
	e := echo.New()
	api.SetupRoutes(e, handlers, middleware.NewAuthMiddleware(service.NewAuthService(store)), middleware.NewTenantMiddleware(store))
	return e
}

// do 发起一次请求，token 为空表示不带会话 Cookie。
func do(t *testing.T, e *echo.Echo, method, path, token, body string) (int, string) {
	t.Helper()
	var reader *strings.Reader
	if body == "" {
		reader = strings.NewReader("")
	} else {
		reader = strings.NewReader(body)
	}
	req := httptest.NewRequest(method, path, reader)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	if token != "" {
		req.AddCookie(&http.Cookie{Name: middleware.SessionCookie, Value: token})
	}
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	return rec.Code, rec.Body.String()
}

// register 注册一个用户并返回其会话 token 及默认租户 ID。
func register(t *testing.T, e *echo.Echo, username, email string) (token, tenantID string) {
	t.Helper()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register",
		strings.NewReader(`{"username":"`+username+`","email":"`+email+`","password":"secret12"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("注册失败: %d %s", rec.Code, rec.Body.String())
	}
	var payload struct {
		Data struct {
			Tenants []struct {
				ID string `json:"id"`
			} `json:"tenants"`
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
	return token, payload.Data.Tenants[0].ID
}

// addMemberAs 让 owner 把某个已注册用户以指定角色加入租户。
func addMemberAs(t *testing.T, e *echo.Echo, ownerToken, tenantID, email string, role model.TenantRole) {
	t.Helper()
	status, body := do(t, e, http.MethodPost, "/api/v1/tenants/"+tenantID+"/members", ownerToken,
		`{"email":"`+email+`","role":"`+string(role)+`"}`)
	if status != http.StatusOK {
		t.Fatalf("添加成员失败: %d %s", status, body)
	}
}

func TestUnauthenticatedRequestsAreRejected(t *testing.T) {
	e := newTestServer(t)
	for _, path := range []string{"/api/v1/tenants", "/api/v1/user/profile", "/api/v1/auth/session"} {
		if status, _ := do(t, e, http.MethodGet, path, "", ""); status != http.StatusUnauthorized {
			t.Errorf("%s 无会话时应返回 401，实际 %d", path, status)
		}
	}
}

func TestInvalidSessionTokenIsRejected(t *testing.T) {
	e := newTestServer(t)
	if status, _ := do(t, e, http.MethodGet, "/api/v1/tenants", "not-a-real-token", ""); status != http.StatusUnauthorized {
		t.Errorf("伪造 token 应返回 401，实际 %d", status)
	}
}

func TestNonMemberCannotReachTenantEndpoints(t *testing.T) {
	e := newTestServer(t)
	_, tenantID := register(t, e, "alice", "alice@example.com")
	outsider, _ := register(t, e, "mallory", "mallory@example.com")

	// 租户隔离：非成员访问他人租户的任何接口都必须被拒绝。
	cases := []struct{ method, path string }{
		{http.MethodGet, "/api/v1/tenants/" + tenantID},
		{http.MethodGet, "/api/v1/tenants/" + tenantID + "/members"},
		{http.MethodDelete, "/api/v1/tenants/" + tenantID},
	}
	for _, tc := range cases {
		if status, body := do(t, e, tc.method, tc.path, outsider, ""); status != http.StatusForbidden {
			t.Errorf("%s %s 非成员应返回 403，实际 %d %s", tc.method, tc.path, status, body)
		}
	}
}

func TestMemberRoleCannotManageTenantOrMembers(t *testing.T) {
	e := newTestServer(t)
	ownerToken, tenantID := register(t, e, "alice", "alice@example.com")
	memberToken, _ := register(t, e, "bobby", "bob@example.com")
	addMemberAs(t, e, ownerToken, tenantID, "bob@example.com", model.TenantRoleMember)

	// member 只有读权限。
	if status, body := do(t, e, http.MethodGet, "/api/v1/tenants/"+tenantID+"/members", memberToken, ""); status != http.StatusOK {
		t.Errorf("member 应可读取成员列表，实际 %d %s", status, body)
	}
	denied := []struct {
		method, path, body string
	}{
		{http.MethodPatch, "/api/v1/tenants/" + tenantID, `{"name":"hijacked","slug":""}`},
		{http.MethodDelete, "/api/v1/tenants/" + tenantID, ""},
		{http.MethodPost, "/api/v1/tenants/" + tenantID + "/members", `{"email":"x@example.com","role":"member"}`},
	}
	for _, tc := range denied {
		if status, body := do(t, e, tc.method, tc.path, memberToken, tc.body); status != http.StatusForbidden {
			t.Errorf("member 执行 %s %s 应返回 403，实际 %d %s", tc.method, tc.path, status, body)
		}
	}
}

func TestAdminCanManageMembersButNotDeleteTenant(t *testing.T) {
	e := newTestServer(t)
	ownerToken, tenantID := register(t, e, "alice", "alice@example.com")
	adminToken, _ := register(t, e, "carol", "carol@example.com")
	register(t, e, "dave", "dave@example.com")
	addMemberAs(t, e, ownerToken, tenantID, "carol@example.com", model.TenantRoleAdmin)

	// admin 可以管理成员。
	if status, body := do(t, e, http.MethodPost, "/api/v1/tenants/"+tenantID+"/members", adminToken,
		`{"email":"dave@example.com","role":"member"}`); status != http.StatusOK {
		t.Errorf("admin 应可添加成员，实际 %d %s", status, body)
	}
	// 但删除租户是 owner 专属权限。
	if status, body := do(t, e, http.MethodDelete, "/api/v1/tenants/"+tenantID, adminToken, ""); status != http.StatusForbidden {
		t.Errorf("admin 删除租户应返回 403，实际 %d %s", status, body)
	}
}

func TestOwnerHasFullAccess(t *testing.T) {
	e := newTestServer(t)
	ownerToken, tenantID := register(t, e, "alice", "alice@example.com")
	checks := []struct {
		method, path, body string
	}{
		{http.MethodGet, "/api/v1/tenants/" + tenantID, ""},
		{http.MethodGet, "/api/v1/tenants/" + tenantID + "/members", ""},
		{http.MethodPatch, "/api/v1/tenants/" + tenantID, `{"name":"Renamed","slug":""}`},
		{http.MethodDelete, "/api/v1/tenants/" + tenantID, ""},
	}
	for _, tc := range checks {
		if status, body := do(t, e, tc.method, tc.path, ownerToken, tc.body); status != http.StatusOK {
			t.Errorf("owner 执行 %s %s 应成功，实际 %d %s", tc.method, tc.path, status, body)
		}
	}
}

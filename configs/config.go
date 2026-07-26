package configs

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig   `json:"server"`
	Database DatabaseConfig `json:"database"`
	Session  SessionConfig  `json:"session"`
}
type ServerConfig struct {
	Port        string   `json:"port"`
	Host        string   `json:"host"`
	CORSOrigins []string `json:"cors_origins"`
	TrustProxy  bool     `json:"trust_proxy"`
}
type DatabaseConfig struct {
	Driver   string `json:"driver"`
	Host     string `json:"host"`
	Port     string `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	DBName   string `json:"dbname"`
	SSLMode  string `json:"sslmode"`
	Path     string `json:"path"`
}
type SessionConfig struct {
	ExpireHour   int  `json:"expire_hour"`
	CookieSecure bool `json:"cookie_secure"`
}

var AppConfig *Config

func Init() error {
	if err := godotenv.Load(); err != nil {
		log.Println("未找到 .env，使用环境变量或默认值")
	}
	origins, err := parseOrigins(getEnv("CORS_ALLOW_ORIGINS", "http://localhost:5173,http://localhost:3000"))
	if err != nil {
		return err
	}
	cookieSecure, err := getEnvBool("COOKIE_SECURE", false)
	if err != nil {
		return err
	}
	trustProxy, err := getEnvBool("TRUST_PROXY", false)
	if err != nil {
		return err
	}
	AppConfig = &Config{Server: ServerConfig{Port: getEnv("SERVER_PORT", "1323"), Host: getEnv("SERVER_HOST", "0.0.0.0"), CORSOrigins: origins, TrustProxy: trustProxy}, Database: DatabaseConfig{Driver: getEnv("DB_DRIVER", "sqlite"), Host: getEnv("DB_HOST", "localhost"), Port: getEnv("DB_PORT", "5432"), Username: getEnv("DB_USERNAME", "postgres"), Password: getEnv("DB_PASSWORD", ""), DBName: getEnv("DB_NAME", "fullstack_template"), SSLMode: getEnv("DB_SSLMODE", "disable"), Path: getEnv("DB_PATH", "app.db")}, Session: SessionConfig{ExpireHour: getEnvInt("SESSION_EXPIRE_HOUR", 24), CookieSecure: cookieSecure}}
	if AppConfig.Database.Driver != "sqlite" && AppConfig.Database.Driver != "postgres" && AppConfig.Database.Driver != "postgresql" {
		return fmt.Errorf("DB_DRIVER 仅支持 sqlite 或 postgres")
	}
	return nil
}

// parseOrigins 解析逗号分隔的来源列表。这里必须自己校验并返回错误，
// 因为 echo 的 CORS 中间件遇到非法来源会直接 panic，而不是报配置错误。
func parseOrigins(raw string) ([]string, error) {
	items := strings.Split(raw, ",")
	origins := make([]string, 0, len(items))
	for _, item := range items {
		item = strings.TrimSpace(item)
		if item == "" {
			continue
		}
		if item == "*" {
			return nil, fmt.Errorf("CORS_ALLOW_ORIGINS 不能为 *，会话使用 Cookie 凭证，通配来源不被允许")
		}
		u, err := url.Parse(item)
		if err != nil || u.Scheme == "" || u.Host == "" {
			return nil, fmt.Errorf("CORS_ALLOW_ORIGINS 含非法来源 %q，需形如 https://example.com", item)
		}
		origins = append(origins, item)
	}
	if len(origins) == 0 {
		return nil, fmt.Errorf("CORS_ALLOW_ORIGINS 不能为空")
	}
	return origins, nil
}
func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
func getEnvInt(k string, d int) int {
	raw := os.Getenv(k)
	if raw == "" {
		return d
	}
	v, err := strconv.Atoi(raw)
	if err != nil {
		log.Printf("环境变量 %s=%q 不是合法整数，使用默认值 %d", k, raw, d)
		return d
	}
	return v
}

// getEnvBool 严格解析布尔值：安全开关一旦拼写错误就静默失败，比启动失败更危险。
func getEnvBool(k string, d bool) (bool, error) {
	raw := os.Getenv(k)
	if raw == "" {
		return d, nil
	}
	v, err := strconv.ParseBool(raw)
	if err != nil {
		return false, fmt.Errorf("环境变量 %s=%q 不是合法布尔值（true/false/1/0）", k, raw)
	}
	return v, nil
}

// sqliteDSN 拼接 SQLite DSN。加了 file: 前缀后整串会按 URI 解析，
// 路径里未转义的 ? 和 # 会截断文件名，并把 pragma 一起丢掉。
func sqliteDSN(path string) string {
	const pragmas = "_pragma=foreign_keys(1)&_pragma=busy_timeout(5000)"
	if strings.HasPrefix(path, "file:") {
		if strings.Contains(path, "?") {
			return path + "&" + pragmas
		}
		return path + "?" + pragmas
	}
	escaped := strings.NewReplacer("%", "%25", "?", "%3F", "#", "%23").Replace(path)
	return "file:" + escaped + "?" + pragmas
}

func (c *Config) GetDatabaseDSN() string {
	if c.Database.Driver == "sqlite" {
		// 外键约束是连接级设置，必须通过 DSN 在每个连接上开启，
		// 否则 ON DELETE CASCADE / SET NULL 都不会生效。
		return sqliteDSN(c.Database.Path)
	}
	u := &url.URL{Scheme: "postgres", Host: c.Database.Host + ":" + c.Database.Port, Path: c.Database.DBName}
	if c.Database.Username != "" {
		u.User = url.UserPassword(c.Database.Username, c.Database.Password)
	}
	q := u.Query()
	q.Set("sslmode", c.Database.SSLMode)
	u.RawQuery = q.Encode()
	return u.String()
}
func (c *Config) GetServerAddress() string { return c.Server.Host + ":" + c.Server.Port }

package configs

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig   `json:"server"`
	Database DatabaseConfig `json:"database"`
	Session  SessionConfig  `json:"session"`
}
type ServerConfig struct {
	Port string `json:"port"`
	Host string `json:"host"`
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
	Secret     string `json:"secret"`
	ExpireHour int    `json:"expire_hour"`
}

var AppConfig *Config

func Init() error {
	if err := godotenv.Load(); err != nil {
		log.Println("未找到 .env，使用环境变量或默认值")
	}
	AppConfig = &Config{Server: ServerConfig{Port: getEnv("SERVER_PORT", "1323"), Host: getEnv("SERVER_HOST", "0.0.0.0")}, Database: DatabaseConfig{Driver: getEnv("DB_DRIVER", "sqlite"), Host: getEnv("DB_HOST", "localhost"), Port: getEnv("DB_PORT", "5432"), Username: getEnv("DB_USERNAME", "postgres"), Password: getEnv("DB_PASSWORD", ""), DBName: getEnv("DB_NAME", "fullstack_template"), SSLMode: getEnv("DB_SSLMODE", "disable"), Path: getEnv("DB_PATH", "app.db")}, Session: SessionConfig{Secret: getEnv("SESSION_SECRET", "change-me"), ExpireHour: getEnvInt("SESSION_EXPIRE_HOUR", 24)}}
	if AppConfig.Database.Driver != "sqlite" && AppConfig.Database.Driver != "postgres" && AppConfig.Database.Driver != "postgresql" {
		return fmt.Errorf("DB_DRIVER 仅支持 sqlite 或 postgres")
	}
	return nil
}
func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
func getEnvInt(k string, d int) int {
	v, e := strconv.Atoi(os.Getenv(k))
	if e == nil {
		return v
	}
	return d
}
func (c *Config) GetDatabaseDSN() string {
	if c.Database.Driver == "sqlite" {
		return c.Database.Path
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

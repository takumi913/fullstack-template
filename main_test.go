package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"
)

func TestTrailingSlashRedirectTarget(t *testing.T) {
	tests := []struct {
		name     string
		path     string
		query    string
		want     string
		wantOkay bool
	}{
		{name: "root unchanged", path: "/", wantOkay: false},
		{name: "canonical path unchanged", path: "/tools/example", wantOkay: false},
		{
			name:     "trailing slash removed",
			path:     "/tools/example/",
			want:     "/tools/example",
			wantOkay: true,
		},
		{
			name:     "query preserved",
			path:     "/tools/example/",
			query:    "ref=docs",
			want:     "/tools/example?ref=docs",
			wantOkay: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, ok := trailingSlashRedirectTarget(tt.path, tt.query)
			if ok != tt.wantOkay {
				t.Fatalf("ok = %v, want %v", ok, tt.wantOkay)
			}
			if got != tt.want {
				t.Fatalf("target = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestStaticRoutingSEOBehavior(t *testing.T) {
	staticDir, err := os.MkdirTemp(".", ".static-test-*")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := os.RemoveAll(staticDir); err != nil {
			t.Errorf("remove temp static dir: %v", err)
		}
	})
	writeStaticTestFile(t, staticDir, "index.html", "<h1>home</h1>")
	writeStaticTestFile(t, staticDir, "tools/example/index.html", "<h1>tool</h1>")
	writeStaticTestFile(t, staticDir, "resources/index.html", "<h1>resources</h1>")
	writeStaticTestFile(t, staticDir, "ja/tools/example/index.html", "<h1>localized tool</h1>")
	writeStaticTestFile(t, staticDir, "use-cases/example/index.html", "<h1>use case</h1>")
	writeStaticTestFile(
		t,
		staticDir,
		"__spa-fallback.html",
		`<!doctype html><meta name="robots" content="noindex, nofollow"><div id="root"></div>`,
	)
	writeStaticTestFile(t, staticDir, "404.html", "<h1>not found</h1>")
	writeStaticTestFile(t, staticDir, "assets/app.js", "console.log('ok')")
	writeStaticTestFile(t, staticDir, "robots.txt", "User-agent: *")
	writeStaticTestFile(t, staticDir, "sitemap.xml", "<urlset></urlset>")
	writeStaticTestFile(t, staticDir, "manifest.webmanifest", "{}")
	writeStaticTestFile(t, staticDir, "favicon.svg", "<svg></svg>")

	e := echo.New()
	setupStaticFilesFromDir(e, staticDir)

	for _, tt := range []struct {
		name string
		path string
		want string
	}{
		{name: "tool", path: "/tools/example", want: "tool"},
		{name: "resources hub", path: "/resources", want: "resources"},
		{name: "localized tool", path: "/ja/tools/example", want: "localized tool"},
		{name: "use case", path: "/use-cases/example", want: "use case"},
	} {
		t.Run("serves prerendered "+tt.name, func(t *testing.T) {
			rec := performStaticRequest(e, tt.path)
			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
			}
			if !strings.Contains(rec.Body.String(), tt.want) {
				t.Fatalf("body = %q, want %q", rec.Body.String(), tt.want)
			}
		})
	}

	for _, tt := range []struct {
		name string
		from string
		to   string
	}{
		{name: "tool", from: "/tools/example/?ref=docs", to: "/tools/example?ref=docs"},
		{name: "resources", from: "/resources/", to: "/resources"},
		{name: "localized tool", from: "/ja/tools/example/", to: "/ja/tools/example"},
		{name: "use case", from: "/use-cases/example/", to: "/use-cases/example"},
	} {
		t.Run("redirects "+tt.name+" trailing slash", func(t *testing.T) {
			rec := performStaticRequest(e, tt.from)
			if rec.Code != http.StatusPermanentRedirect {
				t.Fatalf("status = %d, want %d", rec.Code, http.StatusPermanentRedirect)
			}
			if got := rec.Header().Get("Location"); got != tt.to {
				t.Fatalf("Location = %q, want %q", got, tt.to)
			}
		})
	}

	t.Run("prerendered HTML is not cached aggressively", func(t *testing.T) {
		rec := performStaticRequest(e, "/tools/example")
		if got := rec.Header().Get("Cache-Control"); got != "no-cache" {
			t.Fatalf("Cache-Control = %q, want %q", got, "no-cache")
		}
	})

	t.Run("unhashed public assets require revalidation", func(t *testing.T) {
		for _, path := range []string{"/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/favicon.svg"} {
			rec := performStaticRequest(e, path)
			if rec.Code != http.StatusOK {
				t.Fatalf("%s status = %d, want %d", path, rec.Code, http.StatusOK)
			}
			if got := rec.Header().Get("Cache-Control"); got != "no-cache" {
				t.Fatalf("%s Cache-Control = %q, want %q", path, got, "no-cache")
			}
		}
	})

	t.Run("fingerprinted assets use immutable caching", func(t *testing.T) {
		rec := performStaticRequest(e, "/assets/app.js")
		if rec.Code != http.StatusOK {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
		}
		if got := rec.Header().Get("Cache-Control"); got != "public, max-age=31536000, immutable" {
			t.Fatalf("Cache-Control = %q", got)
		}
	})

	t.Run("private SPA fallback is noindex", func(t *testing.T) {
		rec := performStaticRequest(e, "/dashboard")
		if rec.Code != http.StatusOK {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
		}
		if got := rec.Header().Get("X-Robots-Tag"); got != "noindex, nofollow" {
			t.Fatalf("X-Robots-Tag = %q", got)
		}
	})

	t.Run("unknown public path returns a real 404", func(t *testing.T) {
		rec := performStaticRequest(e, "/definitely-missing")
		if rec.Code != http.StatusNotFound {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
		}
		if !strings.Contains(rec.Body.String(), "not found") {
			t.Fatalf("body = %q, want custom 404 page", rec.Body.String())
		}
		if got := rec.Header().Get("X-Robots-Tag"); got != "noindex, nofollow" {
			t.Fatalf("X-Robots-Tag = %q", got)
		}
		if got := rec.Header().Get("Cache-Control"); got != "no-cache" {
			t.Fatalf("Cache-Control = %q, want %q", got, "no-cache")
		}
	})

	t.Run("API paths never fall back to static HTML", func(t *testing.T) {
		rec := performStaticRequest(e, "/api/definitely-missing")
		if rec.Code != http.StatusNotFound {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
		}
		if strings.Contains(rec.Body.String(), "<h1>") {
			t.Fatalf("body = %q, API request unexpectedly received HTML", rec.Body.String())
		}
	})
}

func writeStaticTestFile(t *testing.T, root, name, content string) {
	t.Helper()
	path := filepath.Join(root, filepath.FromSlash(name))
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func performStaticRequest(e *echo.Echo, target string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, target, nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	return rec
}

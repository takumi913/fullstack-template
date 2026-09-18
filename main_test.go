package main

import "testing"

func TestTrailingSlashRedirectTarget(t *testing.T) {
	tests := []struct {
		name     string
		path     string
		query    string
		want     string
		wantOkay bool
	}{
		{name: "root unchanged", path: "/", wantOkay: false},
		{name: "canonical path unchanged", path: "/tools/json-formatter", wantOkay: false},
		{
			name:     "trailing slash removed",
			path:     "/tools/json-formatter/",
			want:     "/tools/json-formatter",
			wantOkay: true,
		},
		{
			name:     "query preserved",
			path:     "/tools/json-formatter/",
			query:    "ref=docs",
			want:     "/tools/json-formatter?ref=docs",
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

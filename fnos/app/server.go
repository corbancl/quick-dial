package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

var (
	appsDir   = "/var/apps"
	staticDir string
	port      = 9527
)

var (
	appCache   []map[string]interface{}
	cacheTime  time.Time
	cacheMutex sync.Mutex
	cacheTTL   = 60 * time.Second
)

func matchLine(content, pattern string) string {
	re := regexp.MustCompile(`(?m)` + pattern)
	m := re.FindStringSubmatch(content)
	if m == nil {
		return ""
	}
	return strings.TrimSpace(m[1])
}

func getApps() []map[string]interface{} {
	cacheMutex.Lock()
	defer cacheMutex.Unlock()
	if appCache != nil && time.Since(cacheTime) < cacheTTL {
		return appCache
	}
	apps := []map[string]interface{}{}
	entries, err := os.ReadDir(appsDir)
	if err != nil {
		return apps
	}
	skipPrefixes := []string{"nodejs", "python", "java", "redis", "minio", "mariadb", "rabbitmq"}
	for _, e := range entries {
		full := filepath.Join(appsDir, e.Name())
		info, err := os.Stat(full)
		if err != nil || !info.IsDir() {
			continue
		}
		data, err := os.ReadFile(filepath.Join(full, "manifest"))
		if err != nil {
			continue
		}
		content := string(data)
		name := matchLine(content, `^appname\s*=\s*(.+)`)
		if name == "" {
			name = e.Name()
		}
		if name == "quick-dial" {
			continue
		}
		skip := false
		for _, p := range skipPrefixes {
			if strings.HasPrefix(name, p) {
				skip = true
				break
			}
		}
		if skip {
			continue
		}
		display := matchLine(content, `^display_name\s*=\s*(.+)`)
		portStr := matchLine(content, `^service_port\s*=\s*(\d+)`)
		if display == "" || portStr == "" {
			continue
		}
		portNum, err := strconv.Atoi(portStr)
		if err != nil || portNum < 1 || portNum > 65535 {
			continue
		}
		apps = append(apps, map[string]interface{}{
			"name": display,
			"port": portNum,
		})
	}
	appCache = apps
	cacheTime = time.Now()
	return apps
}

func apiAppsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == "OPTIONS" {
		w.WriteHeader(204)
		return
	}
	apps := getApps()
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(apps)
}

func mimeType(ext string) string {
	m := map[string]string{
		".html": "text/html; charset=utf-8",
		".css":  "text/css",
		".js":   "application/javascript",
		".json": "application/json",
		".png":  "image/png",
		".jpg":  "image/jpeg",
		".svg":  "image/svg+xml",
		".ttf":  "font/ttf",
		".woff": "font/woff",
		".woff2": "font/woff2",
		".ico":  "image/x-icon",
		".xml":  "application/xml",
		".txt":  "text/plain; charset=utf-8",
	}
	if v, ok := m[ext]; ok {
		return v
	}
	return "application/octet-stream"
}

func isImmutable(ext string) bool {
	return regexp.MustCompile(`\.(css|js|woff2?|ttf|png|jpg|svg|ico)$`).MatchString(ext)
}

func staticHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	urlPath := r.URL.Path
	if urlPath == "/" {
		urlPath = "/index.html"
	}
	clean := filepath.Clean(urlPath)
	if strings.Contains(clean, "..") {
		http.Error(w, "403 Forbidden", 403)
		return
	}
	filePath := filepath.Join(staticDir, clean)
	info, err := os.Stat(filePath)
	if err != nil || info.IsDir() {
		filePath = filepath.Join(staticDir, "index.html")
	}
	data, err := os.ReadFile(filePath)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	ext := strings.ToLower(filepath.Ext(filePath))
	w.Header().Set("Content-Type", mimeType(ext))
	if isImmutable(ext) {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	} else {
		w.Header().Set("Cache-Control", "no-cache")
	}
	w.Write(data)
}

func main() {
	if p := os.Getenv("QD_PORT"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			port = v
		}
	}
	exe, err := os.Executable()
	if err == nil {
		staticDir = filepath.Join(filepath.Dir(exe), "ui")
	}
	if sd := os.Getenv("QD_STATIC_DIR"); sd != "" {
		staticDir = sd
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/apps", apiAppsHandler)
	mux.HandleFunc("/", staticHandler)

	addr := fmt.Sprintf("0.0.0.0:%d", port)
	fmt.Printf("Quick Dial server started on port %d (static=%s)\n", port, staticDir)
	if err := http.ListenAndServe(addr, mux); err != nil {
		fmt.Printf("server error: %v\n", err)
		os.Exit(1)
	}
}

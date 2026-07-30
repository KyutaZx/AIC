package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	offtakers, err := loadOfftakers("offtaker_pool.json")
	if err != nil {
		log.Fatalf("failed to load offtaker pool: %v", err)
	}

	aiEngineURL := getEnv("AI_ENGINE_URL", "http://localhost:8001")
	port := getEnv("PORT", "8000")
	timeoutSeconds := getEnvInt("AI_ENGINE_TIMEOUT", 30)

	h := &Handler{
		Offtakers:   offtakers,
		AIEngineURL: aiEngineURL,
		HTTPClient: &http.Client{
			Timeout: time.Duration(timeoutSeconds) * time.Second,
		},
	}

	allowedOrigin := getEnv("CORS_ALLOW_ORIGIN", "http://localhost:3000")

	router := gin.Default()
	router.Use(corsMiddleware(allowedOrigin))
	router.POST("/api/v1/predict", h.Predict)

	log.Printf("AquaRoute backend listening on :%s (AI engine: %s)", port, aiEngineURL)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

// corsMiddleware allows the Next.js frontend (browser) to call the backend.
// curl works without this because CORS is enforced only by browsers.
func corsMiddleware(allowedOrigin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", allowedOrigin)
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}

package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const maxImageSizeBytes = 5 * 1024 * 1024 // 5MB
const lowConfidenceThreshold = 0.80

// Handler holds the dependencies needed to serve /api/v1/predict.
type Handler struct {
	Offtakers   []Offtaker
	AIEngineURL string
	HTTPClient  *http.Client
}

type predictRequest struct {
	ImageBase64 string `json:"image_base64" binding:"required"`
	HasIce      bool   `json:"has_ice"`
	// UserLat/UserLng are optional: sent only when the browser granted
	// geolocation. When present, backend computes real offtaker distances.
	UserLat *float64 `json:"user_lat,omitempty"`
	UserLng *float64 `json:"user_lng,omitempty"`
}

type aiInferenceRequest struct {
	ImageBase64 string `json:"image_base64"`
}

type aiInferenceResponse struct {
	Tier          string             `json:"tier"`
	Confidence    float64            `json:"confidence"`
	Probabilities map[string]float64 `json:"probabilities"`
	HeatmapBase64 string             `json:"heatmap_base64"`
}

type offtakerResponse struct {
	Nama         string   `json:"nama"`
	Lokasi       string   `json:"lokasi"`
	Jarak        string   `json:"jarak"`
	Kontak       string   `json:"kontak"`
	TierAccepted []string `json:"tier_accepted"`
}

// Predict handles POST /api/v1/predict: validates the photo, forwards it to
// the AI Engine, applies business rules, and returns the final recommendation.
func (h *Handler) Predict(c *gin.Context) {
	var req predictRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Payload tidak valid: " + err.Error(),
			"code":    "INVALID_PAYLOAD",
		})
		return
	}

	rawBase64 := stripDataURIPrefix(req.ImageBase64)

	imageBytes, err := base64.StdEncoding.DecodeString(rawBase64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Foto tidak valid: gagal decode base64",
			"code":    "INVALID_IMAGE",
		})
		return
	}

	if len(imageBytes) > maxImageSizeBytes {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Foto terlalu besar (maksimal 5MB)",
			"code":    "IMAGE_TOO_LARGE",
		})
		return
	}

	if !isImageContentType(imageBytes) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Format tidak didukung. Gunakan JPG, PNG, atau WEBP",
			"code":    "INVALID_IMAGE",
		})
		return
	}

	aiResp, err := h.callAIEngine(rawBase64)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"error":   "AI Engine tidak tersedia",
			"code":    "AI_ENGINE_DOWN",
		})
		return
	}

	finalTier, iceDegraded := applyIceDegradation(aiResp.Tier, req.HasIce)
	meta := tierMeta[finalTier]

	matched := filterOfftakersByTier(h.Offtakers, finalTier)
	ranked, jarakReal := rankOfftakers(matched, req.UserLat, req.UserLng)
	offtakerList := make([]offtakerResponse, 0, len(ranked))
	for _, o := range ranked {
		offtakerList = append(offtakerList, offtakerResponse{
			Nama:         o.Nama,
			Lokasi:       o.Lokasi,
			Jarak:        o.Jarak,
			Kontak:       o.Kontak,
			TierAccepted: o.TierAccepted,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success":                true,
		"tier":                   finalTier,
		"tier_label":             meta.Label,
		"confidence":             aiResp.Confidence,
		"estimasi_sisa_jam":      meta.EstimasiWaktu,
		"rekomendasi":            meta.Rekomendasi,
		"low_confidence_warning": aiResp.Confidence < lowConfidenceThreshold,
		"ice_degraded":           iceDegraded,
		// sni_indikator is keyed on the FINAL tier (after has_ice degradation),
		// not the raw tier from the AI Engine.
		"sni_indikator":  sniIndikator[finalTier],
		"heatmap_base64": aiResp.HeatmapBase64,
		"offtakers":      offtakerList,
		// jarak_real = true when offtaker distances were computed from the
		// user's real browser location; false when using static fallback.
		"jarak_real": jarakReal,
	})
}

// callAIEngine forwards the decoded photo to the AI Engine's /ai/inference endpoint.
func (h *Handler) callAIEngine(rawBase64 string) (*aiInferenceResponse, error) {
	reqBody, err := json.Marshal(aiInferenceRequest{ImageBase64: rawBase64})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, h.AIEngineURL+"/ai/inference", bytes.NewReader(reqBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := h.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("ai engine returned non-200 status")
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var aiResp aiInferenceResponse
	if err := json.Unmarshal(body, &aiResp); err != nil {
		return nil, err
	}

	return &aiResp, nil
}

// stripDataURIPrefix removes a leading "data:image/...;base64," prefix, if present,
// since the AI Engine expects raw base64 without it.
func stripDataURIPrefix(s string) string {
	if strings.HasPrefix(s, "data:") {
		if idx := strings.Index(s, ","); idx != -1 {
			return s[idx+1:]
		}
	}
	return s
}

// isImageContentType sniffs the decoded bytes to confirm they are an image.
func isImageContentType(data []byte) bool {
	contentType := http.DetectContentType(data)
	return strings.HasPrefix(contentType, "image/")
}

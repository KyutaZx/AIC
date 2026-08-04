# Architecture — AquaRoute AI

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                   User (HP/Browser)                  │
└────────────────────────┬────────────────────────────┘
                         │ Upload foto + input opsional
                         ▼
┌─────────────────────────────────────────────────────┐
│          Frontend — React/Next.js + Tailwind         │
│                    Port: 3000                        │
│  - Single page, mobile-first                        │
│  - Upload foto → POST /api/v1/predict               │
└────────────────────────┬────────────────────────────┘
                         │ POST /api/v1/predict
                         │ {image_base64, has_ice, jam_sejak_tangkap}
                         ▼
┌─────────────────────────────────────────────────────┐
│           Backend — Golang Gin                       │
│                    Port: 8000                        │
│  - Validasi payload                                 │
│  - Forward foto ke AI Engine                        │
│  - Terima Tier + confidence                         │
│  - Apply business rule has_ice                      │
│  - Match Tier → offtaker dari JSON                  │
│  - Return hasil lengkap ke Frontend                 │
└───────────┬─────────────────────────────────────────┘
            │ POST /ai/inference
            │ {image_base64}
            ▼
┌─────────────────────────────────────────────────────┐
│           AI Engine — Python FastAPI + PyTorch       │
│                    Port: 8001                        │
│  - Load best_visual.pt sekali saat startup          │
│  - Preprocessing: resize 224×224, normalize         │
│  - Forward pass MobileNetV3-Small                   │
│  - Return: tier, confidence, probabilities          │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Teknologi | Versi | Alasan |
|---|---|---|---|
| AI Engine | Python + FastAPI | 3.10 / 0.100+ | Standard ML serving |
| AI Model | PyTorch + MobileNetV3-Small | 2.x | Ringan, akurat 85.00% (split bebas kebocoran) |
| Backend | Golang + Gin | 1.21 / latest | Performa tinggi, type-safe |
| Frontend | React + Next.js + Tailwind | 18 / 14 / 3 | SSR, mobile-friendly |
| Container | Docker + Docker Compose | latest | Single command startup |

## Folder Structure

```
aquaroute-ai/
├── CLAUDE.md                    ← dibaca Claude Code otomatis
├── docker-compose.yml
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── OFFTAKER.md
│   └── RULES.md
│
├── ai-engine/
│   ├── main.py                  ← FastAPI app + endpoint /ai/inference
│   ├── model.py                 ← AquaRouteVisualModel class + load logic
│   ├── best_visual.pt           ← model weights (copy dari Google Drive)
│   ├── requirements.txt
│   └── Dockerfile
│
├── backend/
│   ├── main.go                  ← Gin app + endpoint /api/v1/predict
│   ├── handler.go               ← request handler
│   ├── business.go              ← business rules (has_ice, offtaker match)
│   ├── offtaker_pool.json       ← data offtaker hardcoded
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx         ← single page (upload + hasil)
    │   │   └── layout.tsx
    │   ├── components/
    │   │   ├── PhotoUpload.tsx
    │   │   ├── ResultCard.tsx
    │   │   ├── TierBadge.tsx
    │   │   ├── OfftakerList.tsx
    │   │   └── PhotoGuide.tsx
    │   └── lib/
    │       └── api.ts           ← fetch ke backend
    ├── package.json
    ├── tailwind.config.ts
    └── Dockerfile
```

## API Contracts

### Frontend → Backend

**Request**
```
POST /api/v1/predict
Content-Type: application/json

{
  "image_base64": "data:image/jpeg;base64,/9j/...",
  "has_ice": true,
  "jam_sejak_tangkap": 4        // opsional, null jika tidak diisi
}
```

**Response (sukses)**
```json
{
  "success": true,
  "tier": "Tier3_Prima",
  "tier_label": "PRIMA",
  "confidence": 0.98,
  "estimasi_sisa_jam": "> 18 jam",
  "rekomendasi": "Kirim lintas provinsi / ekspor hub",
  "low_confidence_warning": false,
  "ice_degraded": false,
  "offtakers": [
    {
      "nama": "CV Maju Bahari",
      "lokasi": "Surabaya",
      "jarak_km": 45,
      "kontak": "081234567890",
      "tier_accepted": ["Tier2_Sedang", "Tier3_Prima"]
    }
  ]
}
```

**Response (error)**
```json
{
  "success": false,
  "error": "AI Engine tidak tersedia",
  "code": "AI_ENGINE_DOWN"
}
```

### Backend → AI Engine

**Request**
```
POST /ai/inference
Content-Type: application/json

{
  "image_base64": "/9j/..."    // tanpa prefix data:image/...
}
```

**Response**
```json
{
  "tier": "Tier3_Prima",
  "confidence": 0.98,
  "probabilities": {
    "Tier1_Kritis": 0.01,
    "Tier2_Sedang": 0.01,
    "Tier3_Prima": 0.98
  }
}
```

## Docker Compose

```yaml
# docker-compose.yml (struktur)
services:
  ai-engine:
    build: ./ai-engine
    ports: ["8001:8001"]
    
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      AI_ENGINE_URL: http://ai-engine:8001
    depends_on: [ai-engine]
    
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_BACKEND_URL: http://localhost:8000
    depends_on: [backend]
```

## Data Flow Detail

1. User upload foto di browser
2. Frontend convert ke base64, POST ke `/api/v1/predict` dengan `has_ice` dan `jam_sejak_tangkap`
3. Backend validasi payload (format foto, ukuran max 5MB)
4. Backend POST ke AI Engine `/ai/inference` dengan image_base64
5. AI Engine: decode base64 → PIL Image → resize 224×224 → normalize → forward pass → softmax
6. AI Engine return `tier`, `confidence`, `probabilities`
7. Backend apply business rule: jika `has_ice = false` → degrade Tier
8. Backend match Tier final ke `offtaker_pool.json` → filter offtaker yang menerima Tier ini
9. Backend return response lengkap ke Frontend
10. Frontend render: TierBadge + confidence + estimasi waktu + OfftakerList

## Error Handling

| Skenario | Handling |
|---|---|
| AI Engine down | Backend return error 503, Frontend tampilkan pesan "Sistem AI tidak tersedia, coba lagi" |
| Foto bukan gambar | Backend validasi content-type, return 400 |
| Foto terlalu besar (> 5MB) | Backend reject, Frontend tampilkan pesan |
| Confidence < 80% | Backend flag `low_confidence_warning: true`, Frontend tampilkan peringatan panduan foto |
| Timeout AI Engine | Backend timeout 30 detik, return 503 |

## Environment Variables

**Backend**
```
AI_ENGINE_URL=http://ai-engine:8001
PORT=8000
AI_ENGINE_TIMEOUT=30
```

**Frontend**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

# Rules — FreshCo

## Git & Commit

### Conventional Commits (WAJIB)
```
feat: tambah endpoint /ai/inference
fix: perbaiki preprocessing gambar yang crash saat channel != 3
refactor: pisahkan business logic ke business.go
```

Format: `<type>: <deskripsi singkat dalam bahasa Inggris>`

| Type | Kapan |
|---|---|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `refactor` | Restructure tanpa mengubah behavior |
| `docs` | Update dokumentasi |
| `chore` | Konfigurasi, Dockerfile, docker-compose |

### Branch Strategy (solo developer, simplified)
```
main       ← production-ready, selalu bisa di-demo
dev        ← working branch
```

Commit langsung ke `dev`, merge ke `main` hanya saat milestone selesai.

---

## Python (AI Engine)

### Style
- Ikuti PEP 8
- Type hints wajib di semua function signature
- Docstring singkat untuk function publik

```python
# BENAR
def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Decode bytes, resize 224x224, normalize ImageNet."""
    ...

# SALAH — tidak ada type hint, tidak ada docstring
def preprocess(img):
    ...
```

### Struktur FastAPI
```python
# main.py — hanya routing dan startup
# model.py — semua logic model (class, load, inference)

# Model WAJIB di-load di startup event, BUKAN per request
@app.on_event("startup")
async def startup():
    load_model()  # sekali saja
```

### Error Handling
```python
# Selalu return JSON yang konsisten
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "tier": None, "confidence": None}
    )
```

### Dependencies
- Semua di `requirements.txt` dengan versi pin: `torch==2.x.x`
- Jangan `requirements.txt` tanpa versi — tidak reproducible

---

## Golang (Backend)

### Style
- Ikuti `gofmt` — jalankan sebelum commit
- Error handling eksplisit, tidak ada `_` untuk error penting
- Tidak ada `panic()` di production code

```go
// BENAR
result, err := callAIEngine(imageBase64)
if err != nil {
    c.JSON(503, gin.H{"success": false, "error": "AI Engine tidak tersedia"})
    return
}

// SALAH
result, _ := callAIEngine(imageBase64)
```

### Struktur File
```
main.go      ← inisialisasi Gin, routing, load offtaker JSON
handler.go   ← HTTP handler untuk /api/v1/predict
business.go  ← business rules (has_ice degradation, offtaker filter)
```

### HTTP Client
- Selalu set timeout untuk request ke AI Engine
- Default timeout: 30 detik

```go
client := &http.Client{
    Timeout: 30 * time.Second,
}
```

### Response Format
Selalu gunakan format yang konsisten:
```go
// Sukses
c.JSON(200, gin.H{"success": true, ...})

// Error
c.JSON(statusCode, gin.H{"success": false, "error": "pesan error", "code": "ERROR_CODE"})
```

---

## TypeScript / React (Frontend)

### Style
- TypeScript strict mode ON (`"strict": true` di tsconfig)
- Interface untuk semua props dan API response
- Tidak ada `any` type kecuali benar-benar tidak bisa dihindari

```typescript
// BENAR
interface PredictResponse {
  success: boolean
  tier: 'Tier3_Prima' | 'Tier2_Sedang' | 'Tier1_Kritis'
  confidence: number
  offtakers: Offtaker[]
}

// SALAH
const data: any = await response.json()
```

### Komponen
- Satu file satu komponen
- Nama file = nama komponen: `TierBadge.tsx`
- Props interface di atas komponen, bukan di file terpisah

```typescript
interface TierBadgeProps {
  tier: 'Tier3_Prima' | 'Tier2_Sedang' | 'Tier1_Kritis'
  confidence: number
}

export default function TierBadge({ tier, confidence }: TierBadgeProps) {
  ...
}
```

### State Management
- Gunakan `useState` dan `useReducer` — tidak perlu Redux/Zustand untuk MVP ini
- Semua API call di `lib/api.ts`, bukan langsung di komponen

```typescript
// lib/api.ts
export async function predict(payload: PredictRequest): Promise<PredictResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Request gagal')
  return res.json()
}
```

### Tailwind
- Gunakan class utility Tailwind saja — tidak ada custom CSS kecuali sangat perlu
- Warna Tier harus konsisten: green-600, amber-600, red-600

---

## Docker

### Dockerfile Pattern
Setiap service harus pakai multi-stage atau minimal approach:

```dockerfile
# AI Engine — contoh pattern
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### docker-compose.yml
- Semua service harus ada `depends_on` yang benar
- Gunakan network internal untuk komunikasi antar service
- Jangan expose port AI Engine ke host (hanya backend yang perlu akses)

---

## General Rules

1. **Tidak ada TODO di commit** — kalau ada TODO, buat issue atau selesaikan sekarang
2. **Tidak ada hardcoded secret** — URL, port, config di environment variable
3. **Test manual setelah setiap komponen selesai** — jangan lanjut sebelum yang sekarang jalan
4. **`docker compose up` adalah source of truth** — kalau jalan di sini, berarti benar
5. **Bahasa kode**: English (variable, function, comment)
6. **Bahasa UI**: Bahasa Indonesia (untuk pengguna pengepul)

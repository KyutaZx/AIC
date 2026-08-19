# FreshCo

**Distribusi ikan berbasis kondisi, bukan tebakan.**

FreshCo adalah sistem rekomendasi distribusi ikan berbasis AI untuk pengepul/koperasi ikan di Tempat Pelelangan Ikan (TPI). Alih-alih hanya mengklasifikasikan ikan "segar/tidak segar", sistem ini menjawab pertanyaan yang lebih konkret: **dengan kondisi ikan ini, sebaiknya didistribusikan ke mana, dan seberapa mendesak?**

Cukup foto ikan → sistem mengklasifikasikan kondisi ke dalam 3 Tier (Prima/Sedang/Kritis) menggunakan model computer vision → sistem merekomendasikan rute distribusi dan daftar offtaker terdekat yang sesuai.

---

## Arsitektur Sistem

| Service | Teknologi | Port | Fungsi |
|---|---|---|---|
| **AI Engine** | Python FastAPI + PyTorch (MobileNetV3-Small) | 8001 (internal) | Klasifikasi kondisi ikan dari foto |
| **Backend** | Golang + Gin | 8000 | Business logic, matching offtaker, forward ke AI Engine |
| **Frontend** | Next.js + Tailwind | 3000 | Antarmuka upload foto dan tampilan hasil |

Ketiga service dijalankan bersamaan lewat `docker compose up` — tidak perlu instalasi Python/Go/Node.js manual di komputer kamu, semua sudah dikemas dalam container.

```
Frontend (browser)
   │  POST foto + input
   ▼
Backend (Golang) ──── POST foto ────▶ AI Engine (Python)
   │                                        │
   │◀─────────── Tier + confidence ─────────┘
   │
   ▼
Business rules (has_ice) + matching offtaker
   │
   ▼
Hasil rekomendasi ditampilkan di Frontend
```

---

## Prasyarat

Sebelum memulai, pastikan sudah terinstall:

- **Docker Desktop** (sudah termasuk Docker Compose) — [download di sini](https://www.docker.com/products/docker-desktop/)
- **Git**
- Ruang disk kosong minimal ~2GB (untuk image Docker)
- Koneksi internet (untuk download base image saat build pertama kali)

Tidak perlu install Python, Go, atau Node.js secara manual — semuanya sudah dikemas di dalam container Docker.

---

## Cara Menjalankan (Setup Guide)

### 1. Clone repository

```bash
git clone https://github.com/KyutaZx/AIC.git
cd AIC
```

### 2. Download model AI

File model (`best_visual.pt`, ~4MB) tidak disertakan di repository ini karena ukurannya, dan tidak cocok untuk version control. Download dari Google Drive berikut:

**[Download best_visual.pt](https://drive.google.com/drive/folders/1SOB6dgThr1tDixXxA7BMjDKrOTugESf7?usp=sharing)**

Setelah didownload, letakkan file `best_visual.pt` di dalam folder `ai-engine/`, sehingga strukturnya menjadi:

```
AIC/
└── ai-engine/
    └── best_visual.pt   ← letakkan di sini
```

### 3. Jalankan seluruh sistem

Dari root folder project (`AIC/`):

```bash
docker compose up --build
```

Build pertama kali akan memakan waktu beberapa menit (download base image, install dependencies). Setelah selesai, kamu akan melihat log dari ketiga service menunjukkan masing-masing sudah listening:

```
ai-engine-1  | INFO:     Application startup complete.
ai-engine-1  | INFO:     Uvicorn running on http://0.0.0.0:8001
backend-1    | FreshCo backend listening on :8000
frontend-1   | ▲ Next.js ready on http://localhost:3000
```

### 4. Akses aplikasi

Buka browser ke:

```
http://localhost:3000
```

Upload foto ikan (1 ekor, background bersih, seluruh badan masuk frame), atur toggle "Ada Es?" sesuai kondisi, lalu klik **Analisis Ikan**.

### 5. Menghentikan sistem

```bash
docker compose down
```

Untuk menjalankan kembali di sesi berikutnya (tanpa build ulang):

```bash
docker compose up
```

---

## Menguji API Secara Langsung (Opsional)

Kalau ingin menguji Backend tanpa lewat UI, gunakan `curl`:

```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"image_base64": "<base64_foto_ikan>", "has_ice": true}'
```

Contoh response:

```json
{
  "success": true,
  "tier": "Tier3_Prima",
  "tier_label": "PRIMA",
  "confidence": 0.98,
  "estimasi_sisa_jam": "> 18 jam",
  "rekomendasi": "Kirim lintas provinsi atau ke hub ekspor",
  "ice_degraded": false,
  "low_confidence_warning": false,
  "offtakers": [ ... ]
}
```

---

## Struktur Project

```
AIC/
├── ai-engine/          # Python FastAPI + PyTorch — klasifikasi kondisi ikan
│   ├── main.py
│   ├── model.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── best_visual.pt  # (didownload manual, tidak masuk git)
├── backend/             # Golang Gin — business logic dan API utama
│   ├── main.go
│   ├── handler.go
│   ├── business.go
│   ├── offtaker_pool.json
│   ├── go.mod
│   └── Dockerfile
├── frontend/            # Next.js + Tailwind — antarmuka pengguna
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── Dockerfile
├── docs/                 # Dokumentasi teknis (PRD, arsitektur, desain, dll)
├── docker-compose.yml
└── README.md
```

---

## Model AI

- **Arsitektur**: Visual-only CNN berbasis MobileNetV3-Small (bukan model fusion)
- **Input**: Foto ikan utuh (224×224, normalisasi ImageNet)
- **Output**: Klasifikasi 3 Tier (Kritis/Sedang/Prima) beserta confidence score
- **Akurasi test set**: 85.00%
- **Dataset**: DaFiF — Prasetyo et al. (2024), *"DaFiF: A Complete Dataset for Fish's Freshness Problems"*, Data in Brief

Model di-fine-tune dari bobot pretrained ImageNet (early layers di-freeze, 3 block terakhir + classifier dilatih ulang) menggunakan skema label baru (Day→Tier) yang berbeda dari skema asli dataset DaFiF.

---

## Troubleshooting

**Port sudah dipakai (`port is already allocated`)**
Pastikan tidak ada container lama yang masih jalan di port yang sama:
```bash
docker ps
docker stop <container_id>
```

**AI Engine error terkait NumPy saat inference**
Sudah ditangani lewat pin versi `numpy==1.26.4` di `requirements.txt`. Kalau masih terjadi, rebuild image:
```bash
docker compose build ai-engine --no-cache
```

**Backend tidak bisa terhubung ke AI Engine**
Pastikan environment variable `AI_ENGINE_URL` mengarah ke `http://ai-engine:8001` (bukan `localhost`) saat dijalankan lewat `docker compose` — ini sudah dikonfigurasi otomatis di `docker-compose.yml`.

**Foto ditolak "terlalu besar"**
Ukuran foto maksimal 5MB. Compress atau resize foto terlebih dahulu jika lebih besar.

---

## Batasan (MVP)

Sesuai scope kompetisi, sistem ini sengaja **tidak** menyertakan:

- Login/autentikasi
- Riwayat penggunaan
- Dashboard analitik
- Database persisten (data offtaker berupa JSON statis)
- Background job/queue
- Notifikasi ke pihak ketiga

Model AI bersifat statis saat demo (tidak ada retraining/auto-tuning). Data offtaker dan estimasi jarak menggunakan data mock untuk keperluan MVP; integrasi Maps API real-time menjadi roadmap pengembangan lanjutan.

---

## Dokumentasi Lengkap

Dokumentasi teknis lebih detail tersedia di folder [`docs/`](./docs):

- [`PRD.md`](./docs/PRD.md) — Product requirements dan scope MVP
- [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Arsitektur sistem dan API contracts
- [`DESIGN.md`](./docs/DESIGN.md) — UI/UX flow dan design system
- [`OFFTAKER.md`](./docs/OFFTAKER.md) — Struktur data offtaker dan business rules
- [`RULES.md`](./docs/RULES.md) — Coding conventions
- [`FINDINGS.md`](./docs/FINDINGS.md) — Investigasi explainability Grad-CAM & metodologi model

---

## Lisensi & Kompetisi

Proyek ini dikembangkan untuk **AI Innovation Challenge (AIC) COMPFEST 18** — Sub-tema Smart Logistics.

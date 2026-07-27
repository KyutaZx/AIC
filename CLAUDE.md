# AquaRoute AI — Claude Code Context

## Identitas Project
- **Kompetisi**: AI Innovation Challenge (AIC) COMPFEST 18 — Sub-tema Smart Logistics
- **Deadline**: 25 Agustus 2026, pukul 23.55 WIB (~4 minggu dari sekarang)
- **Nama sistem**: AquaRoute AI

## Problem
Pengepul ikan di TPI tidak punya cara objektif menentukan distribusi ikan. AquaRoute AI menjawab: **"Dengan kondisi ikan ini, sebaiknya didistribusikan ke mana?"** — bukan sekadar segar/tidak segar, tapi keputusan logistik aktif.

## Stack
| Service | Teknologi | Port |
|---|---|---|
| AI Engine | Python FastAPI + PyTorch (MobileNetV3-Small) | 8001 |
| Backend | Golang Gin | 8000 |
| Frontend | React/Next.js + Tailwind | 3000 |

Semua dijalankan via `docker compose up`.

## Dokumen Referensi
Baca semua dokumen ini sebelum mulai bekerja:
- `docs/PRD.md` — scope MVP, goals, success criteria
- `docs/ARCHITECTURE.md` — folder structure, API contracts, data flow
- `docs/DESIGN.md` — UI/UX flow, design system, komponen
- `docs/OFFTAKER.md` — struktur offtaker_pool.json, business rules Tier
- `docs/RULES.md` — coding conventions, commit style

## Output Model AI
```json
{"tier": "Tier3_Prima", "confidence": 0.98, "probabilities": {"Tier1_Kritis": 0.01, "Tier2_Sedang": 0.01, "Tier3_Prima": 0.98}}
```

Tier mapping:
- **Tier3_Prima** → kirim lintas provinsi / ekspor hub (sisa > 18 jam)
- **Tier2_Sedang** → kirim ke pasar regional antarkabupaten (sisa 6–18 jam)
- **Tier1_Kritis** → jual lokal sekarang atau olah jadi pindang/asin (sisa < 6 jam)

## Rules Keras (JANGAN DILANGGAR)
1. **MVP only** — tidak ada login, riwayat, dashboard, background job, notifikasi
2. **Backend sinkron sepenuhnya** — tidak ada async processing
3. **AI Engine load model sekali saat startup** — tidak saat request
4. **Offtaker Pool = JSON hardcoded** (`offtaker_pool.json`) — tidak ada database
5. **Commit dengan Conventional Commits**: `feat:`, `fix:`, `refactor:`
6. `jam_sejak_tangkap` dan `has_ice` **BUKAN input model** — business rule di backend
7. Business rule `has_ice`: tanpa es → degrade Tier otomatis (3→2, 2→1)

## Status Progress
```
✅ Model best_visual.pt — sudah ada, backup di Google Drive
⬜ AI Engine (FastAPI) — belum
⬜ Backend (Golang Gin) — belum
⬜ Frontend (React/Next.js) — belum
⬜ Docker Compose — belum
```

## Cara Kerja dengan Claude Code
- Satu komponen selesai → commit → lanjut komponen berikutnya
- Urutan: AI Engine → Backend → Docker Compose (test end-to-end) → Frontend
- Selalu jalankan `docker compose up` untuk test, bukan jalankan service manual

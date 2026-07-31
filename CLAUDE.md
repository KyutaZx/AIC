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
5. **Commit dengan Conventional Commits**: `feat:`, `fix:`, `refactor:` (wajib, ini syarat penilaian lomba, bukan sekadar preferensi)
6. `jam_sejak_tangkap` dan `has_ice` **BUKAN input model** — business rule di backend
7. Business rule `has_ice`: tanpa es → degrade Tier otomatis (3→2, 2→1)

## ATURAN LOMBA RESMI (AIC COMPFEST 18) — WAJIB DIPATUHI

Sumber: dokumen resmi panitia. Pelanggaran bisa berakibat diskualifikasi.

### Anonimitas (KRITIS — cek setiap kali menulis dokumen/kode/komentar)
- **DILARANG KERAS** menampilkan identitas, logo, atau nama institusi/universitas asal TIM dalam bentuk apa pun — di kode sumber, komentar, README, proposal, maupun video
- Ini beda dengan sitasi akademik: mengutip paper DaFiF (Prasetyo et al., 2024, ITS Surabaya) sebagai SUMBER DATASET tetap boleh dan wajib (itu institusi peneliti dataset publik, bukan identitas tim)
- Sebelum commit/tulis dokumen apapun, pastikan tidak ada nama kampus/institusi tim yang bocor di file mana pun

### Batasan MVP (diperjelas dari ketentuan resmi — JANGAN OVERBUILD)
- **Frontend**: hanya alur input tunggal → output. Tidak ada dashboard analitik, login/auth kompleks, riwayat penggunaan
- **Backend**: hanya pemrosesan sinkron. Tidak ada background job, antrean data, **automated data logging pipeline**, atau database terdistribusi. Wajib bisa dijalankan penuh dengan `docker compose up`
- **AI Engine**: hanya core inference, parameter statis saat demo. Tidak ada auto-tuning, **bulk testing scripts**, atau feedback loop otomatis
- Proyek dikerjakan HANYA dalam rentang 17 Juni – 25 Agustus 2026 — bukan lanjutan proyek lama

### Model AI — Orisinalitas (dilatih dari nol)
- `best_visual.pt` **dilatih dari nol** (`weights=None`, TIDAK memakai bobot pretrained ImageNet sama sekali), hanya meminjam arsitektur publik MobileNetV3-Small
- Karena tidak memakai bobot pretrained apa pun, syarat "wajib fine-tuning untuk model pihak ketiga/pre-trained" di rulebook lomba **tidak secara ketat berlaku** — itu ditujukan untuk model yang mewarisi bobot pihak ketiga
- Pendekatan full-training-dari-nol ini justru **klaim orisinalitas yang lebih kuat** dibanding sekadar fine-tuning: model ini dibangun sendiri, bukan menumpang bobot orang lain
- Re-labeling Day→Tier (skema baru, bukan skema asli DaFiF) memperkuat orisinalitas

### Deliverables Wajib (submit paling lambat 25 Agustus 2026, 23.55 WIB)

**1. Repository GitHub (Public)**
- Seluruh source code (ai-engine, backend, frontend, docker-compose.yml)
- `README.md` wajib ada — setup guide super jelas: prasyarat, cara clone, cara copy `best_visual.pt` ke `ai-engine/` (model TIDAK di-commit, terlalu besar — cukup link Google Drive di README), cara `docker compose up` sampai bisa diakses browser
- Setiap commit wajib Conventional Commits: `feat:`, `fix:`, `refactor:` — ini dinilai juri langsung, jangan commit dengan pesan asal
- `.gitignore` wajib exclude `best_visual.pt`, `__pycache__`, `node_modules`, file build

**2. Video Proof of Work** (maks 7 menit)
- Upload YouTube, visibility **Unlisted**
- Nama file/judul: `COMPFEST 18 AIC: PROOF OF WORK - [Nama Tim] - [Nama Proyek]`
- Wajib layar ganda (terminal + aplikasi berjalan bersamaan) + timestamp terlihat
- Boleh fast-forward saat loading, **DILARANG KERAS cut/potong video**

**3. Video Promosi** (maks 5 menit)
- Upload YouTube, visibility **Public**
- Nama file/judul: `COMPFEST 18 AIC: [Nama Tim] - [Nama Proyek]`
- Format MP4, resolusi minimal 720p
- Isi: latar belakang masalah, cara kerja produk, storytelling persuasif untuk investor

**4. Proposal Proyek** (PDF, maks 20 halaman — di luar cover/pustaka/lampiran)
- Wajib memuat: Judul & Nama Kelompok, Latar Belakang, Tujuan & Manfaat, Metodologi (alur dataset, alur pengembangan model, alur integrasi kode, justifikasi teknologi berbasis data), Kesimpulan

### Bobot Penilaian (total 105%) — prioritaskan sesuai ini
| Kriteria | Bobot | Fokus |
|---|---|---|
| Implementasi Teknologi & Arsitektur | 25% | Kesesuaian stack, AI core inference bersih, modularitas 3 service terpisah rapi, **kejelasan README.md** |
| Orisinalitas & Dampak Sosial | 20% | Keunikan pendekatan, diferensiasi, urgensi masalah |
| Kesiapan MVP | 15% | Ketepatan scope (tidak kurang, tidak lebih), fleksibilitas iterasi |
| Video Promosi | 15% | Storytelling, kepatuhan durasi/format |
| Kualitas Proposal | 15% | Metodologi lengkap, justifikasi teknis berbasis data |
| Relevansi Tema | 10% | Kesesuaian dengan "AI for the Backbone of the Economy" — Smart Logistics |
| Business Value & Governance (bonus) | 3.5% | Analisis kelayakan adopsi, etika AI |
| AIC Talks (bonus) | 1.5% | Hadir webinar 25 Juli 2026 |

**Implikasi penting**: README.md yang jelas bernilai tinggi (masuk kriteria 25% terbesar). Jangan anggap README remeh — treat sebagai deliverable inti, bukan formalitas.

## Status Progress
```
✅ Model best_visual.pt — sudah ada, backup di Google Drive
✅ AI Engine (FastAPI) — sudah jalan, model ter-load, endpoint /ai/inference berfungsi
✅ Backend (Golang Gin) — AI Engine + Backend tested end-to-end via docker compose up
⬜ Frontend (React/Next.js) — belum
✅ Docker Compose — AI Engine + Backend tested end-to-end via docker compose up
```

## Cara Kerja dengan Claude Code
- Satu komponen selesai → commit → lanjut komponen berikutnya
- Urutan: AI Engine → Backend → Docker Compose (test end-to-end) → Frontend
- Selalu jalankan `docker compose up` untuk test, bukan jalankan service manual

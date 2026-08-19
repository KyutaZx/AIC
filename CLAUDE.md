# FreshCo — Claude Code Context

## Identitas Project
- **Kompetisi**: AI Innovation Challenge (AIC) COMPFEST 18 — Sub-tema Smart Logistics
- **Deadline**: 25 Agustus 2026, pukul 23.55 WIB (~3,5 minggu lagi per 1 Agustus 2026)
- **Nama sistem**: FreshCo

## Problem
Pengepul ikan di TPI tidak punya cara objektif menentukan distribusi ikan. FreshCo menjawab: **"Dengan kondisi ikan ini, sebaiknya didistribusikan ke mana?"** — bukan sekadar segar/tidak segar, tapi keputusan logistik aktif.

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
- `docs/FINDINGS.md` — investigasi explainability Grad-CAM (temuan, eksperimen, perbaikan) — penting untuk bagian metodologi proposal

## Output Model AI
```json
{"tier": "Tier3_Prima", "confidence": 0.98, "probabilities": {"Tier1_Kritis": 0.01, "Tier2_Sedang": 0.01, "Tier3_Prima": 0.98}, "heatmap_base64": "...", "sni_indikator": "..."}
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
6. `has_ice` **BUKAN input model** — business rule di backend
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

### Model AI — Syarat Fine-tuning
- `best_visual.pt` di-fine-tune dari MobileNetV3-Small dengan bobot pretrained ImageNet (early layer frozen, 3 block terakhir + classifier di-unfreeze dan dilatih) — ini memenuhi syarat "wajib fine-tuning untuk model pihak ketiga/pre-trained" secara langsung dan standar
- Re-labeling Day→Tier (skema baru, bukan skema asli DaFiF) memperkuat orisinalitas
- Grad-CAM (explainability) memakai **basic Grad-CAM pada layer konv terakhir** — bobot model TIDAK diubah, murni visualisasi. (Eksperimen Grad-CAM++ 14x14 sempat diadopsi untuk model awal tapi TIDAK transfer ke model retrain, jadi dikembalikan ke basic.) Detail lengkap investigasi & keterbatasan yang masih ada: `docs/FINDINGS.md`

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
- Pilih foto demo yang heatmap Grad-CAM-nya sudah terbukti akurat (background bersih atau ikan horizontal — lihat `docs/FINDINGS.md` untuk kasus yang aman dipakai)

**3. Video Promosi** (maks 5 menit)
- Upload YouTube, visibility **Public**
- Nama file/judul: `COMPFEST 18 AIC: [Nama Tim] - [Nama Proyek]`
- Format MP4, resolusi minimal 720p
- Isi: latar belakang masalah, cara kerja produk, storytelling persuasif untuk investor

**4. Proposal Proyek** (PDF, maks 20 halaman — di luar cover/pustaka/lampiran)
- Wajib memuat: Judul & Nama Kelompok, Latar Belakang, Tujuan & Manfaat, Metodologi (alur dataset, alur pengembangan model, alur integrasi kode, justifikasi teknologi berbasis data), Kesimpulan
- Manfaatkan `docs/FINDINGS.md` untuk bagian metodologi — investigasi Grad-CAM (temuan → eksperimen v2 → uji hipotesis orientasi → perbaikan Grad-CAM++) adalah bukti kuat rigor ilmiah untuk kriteria "Kualitas Proposal & Proses Pengembangan"

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
✅ Model best_visual.pt — retrain aktif (akurasi 85.00% pada split bebas kebocoran data; angka lama 99.21% inflated karena data leakage), backup di Google Drive. Grad-CAM dikembalikan ke basic method pada layer terakhir (Grad-CAM++ 14x14 tidak transfer ke model retrain). Detail: docs/FINDINGS.md.
✅ AI Engine (FastAPI) — sudah jalan, model ter-load, endpoint /ai/inference + heatmap Grad-CAM berfungsi
✅ Backend (Golang Gin) — tested end-to-end via docker compose up
✅ Frontend (React/Next.js + Tailwind) — sudah jalan di port 3000, upload foto → tampil hasil + heatmap
✅ Docker Compose — 3 service (ai-engine + backend + frontend) jalan bersama via docker compose up
✅ GitHub repo — public, README lengkap, Conventional Commits
⬜ Proposal PDF — belum
⬜ Video Proof of Work — belum
⬜ Video Promosi — belum
```

MVP sudah lengkap end-to-end. Sisa fokus: deliverables lomba (Proposal, Video Proof of Work, Video Promosi) & polish minor.

## Cara Kerja dengan Claude Code
- Satu komponen selesai → commit → push ke GitHub
- MVP (AI Engine, Backend, Frontend, Docker Compose) sudah selesai — fokus berikutnya di luar coding: Proposal, Video
- Selalu jalankan `docker compose up` untuk test, bukan jalankan service manual

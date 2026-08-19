# PRD — FreshCo

## 1. Problem Statement

Pengepul dan koperasi ikan di Tempat Pelelangan Ikan (TPI) Indonesia tidak memiliki cara objektif untuk menilai kondisi ikan secara real-time. Akibatnya mereka menghadapi dua pilihan buruk:

- **Jual terlalu cepat** → harga murah, margin hilang
- **Kirim terlalu jauh** → ikan busuk di jalan, rugi total

Estimasi kondisi ikan saat ini bergantung pada intuisi subjektif pengepul. Tidak ada alat bantu keputusan yang portable, murah, dan bisa dipakai di lapangan.

## 2. Solusi

FreshCo menjawab satu pertanyaan: **"Dengan kondisi ikan ini, sebaiknya didistribusikan ke mana?"**

Pengguna cukup foto ikan → sistem mengklasifikasi kondisi ke dalam 3 Tier → sistem merekomendasikan rute distribusi yang optimal dari daftar offtaker terdekat.

Bukan sekadar klasifikasi segar/tidak segar — ini adalah **decision-support tool untuk logistik**.

## 3. Target Pengguna

**Primary**: Pengepul/koperasi ikan di TPI Indonesia
- Menggunakan HP Android mid-range di lapangan
- Tidak tech-savvy, butuh UI yang sangat sederhana
- Keputusan harus cepat (< 30 detik dari foto ke rekomendasi)

**Secondary**: Juri AIC COMPFEST 18 (untuk evaluasi lomba)

## 4. MVP Scope

### Yang ADA di MVP
- Upload foto ikan → klasifikasi Tier → rekomendasi distribusi
- Tampilkan: badge Tier berwarna, confidence %, estimasi sisa waktu, daftar offtaker
- Input opsional: `has_ice` (untuk business rule backend)
- Panduan foto di UI (1 ikan utuh, background bersih)
- Peringatan saat confidence < 80%
- Mobile-responsive

### Yang TIDAK ADA di MVP
- Login / autentikasi
- Riwayat prediksi
- Dashboard analitik
- Notifikasi ke pihak kedua
- Database persisten
- Background job / queue
- Multi-halaman
- Maps API / rute real-time

## 5. Output Tier

| Tier | Nama | Estimasi Sisa Waktu | Rekomendasi |
|---|---|---|---|
| Tier 3 | PRIMA | > 18 jam | Kirim lintas provinsi / ekspor hub |
| Tier 2 | SEDANG | 6–18 jam | Kirim ke pasar regional antarkabupaten |
| Tier 1 | KRITIS | < 6 jam | Jual lokal sekarang atau olah jadi pindang/asin |

## 6. Business Rules

### has_ice (Tanpa Es)
Jika pengguna menginput `has_ice = false`:
- Tier 3 → otomatis turun ke Tier 2
- Tier 2 → otomatis turun ke Tier 1
- Tier 1 → tetap Tier 1 (sudah kritis)

Degradasi ini dilakukan di **backend**, bukan di model AI.

### Confidence Rendah
Jika `confidence < 0.80`:
- Tetap tampilkan hasil
- Tambahkan peringatan: "Foto kurang jelas. Pastikan 1 ikan utuh, background bersih, seluruh badan masuk frame."

## 7. Model AI

- **Arsitektur**: Visual-Only MobileNetV3-Small
- **Input**: Foto ikan utuh (224×224, normalized ImageNet)
- **Output**: Probabilitas 3 kelas + confidence
- **Accuracy**: 85.00% pada test set DaFiF (diukur pada split baru yang bebas kebocoran data)
- **File**: `best_visual.pt`

> **Catatan akurasi**: Angka awal 99.21% ternyata *inflated* akibat data leakage — foto dari sesi pemotretan yang sama muncul di train dan test sekaligus. Setelah diperbaiki dengan split baru berbasis grup (hari + sesi + spesies) dan stratifikasi tier, akurasi final 85.00% diukur pada data yang benar-benar independen dan merupakan angka yang defensible. Detail investigasi: `docs/FINDINGS.md`.

## 8. Success Criteria (untuk Demo Lomba)

- [ ] `docker compose up` → semua service jalan tanpa error
- [ ] Upload foto ikan → hasil muncul dalam < 5 detik
- [ ] Hasil menampilkan: Tier badge, confidence %, estimasi waktu, daftar offtaker
- [ ] Business rule `has_ice` berjalan (Tier turun saat tanpa es)
- [ ] UI mobile-responsive di layar 375px
- [ ] Peringatan muncul saat confidence < 80%

## 9. Constraints

- **Waktu**: ~4 minggu (deadline 25 Agustus 2026)
- **Tim**: Solo developer
- **Infrastruktur**: Docker Compose lokal (bukan cloud)
- **Model**: Static saat demo (tidak ada retraining live)
- **Data offtaker**: Mock/hardcoded JSON (bukan database real)

## 10. Data & Referensi

- **Dataset**: DaFiF (Prasetyo et al., 2024) — ITS Surabaya
- **Standar**: SNI 2729:2013 (mutu ikan segar)
- **Ekspor perikanan Indonesia 2025**: USD 6,27 miliar (KKP, Feb 2026)
- **Susut pascapanen**: ~30–35% (KKP/FAO)

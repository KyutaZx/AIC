# Design — AquaRoute AI

## Design Principles

1. **Mobile-first** — pengguna pakai HP Android di lapangan, bukan desktop
2. **One flow** — satu halaman, satu aksi: foto → hasil. Tidak ada navigasi kompleks
3. **Zero learning curve** — pengepul non-tech-savvy harus bisa pakai tanpa tutorial
4. **High contrast** — dipakai di luar ruangan (sinar matahari), warna harus jelas
5. **Decision-forward** — hasil harus langsung terlihat tanpa scroll

---

## Color System

### Tier Colors (paling penting)
```
Tier 3 PRIMA   → bg: #16a34a (green-600)  | text: white
Tier 2 SEDANG  → bg: #d97706 (amber-600)  | text: white
Tier 1 KRITIS  → bg: #dc2626 (red-600)    | text: white
```

### Base Colors
```
Background     → #f8fafc (slate-50)
Card bg        → #ffffff
Border         → #e2e8f0 (slate-200)
Text primary   → #0f172a (slate-900)
Text secondary → #64748b (slate-500)
Brand accent   → #0284c7 (sky-600)
Warning        → #f59e0b (amber-500)
```

### Confidence Bar
```
>= 80%  → #16a34a (green)
60-79%  → #d97706 (amber)
< 60%   → #dc2626 (red)
```

---

## Typography

```
Font: Inter (Google Fonts) atau system-ui fallback

Tier label (badge)     : text-2xl font-black tracking-wide
Confidence %           : text-3xl font-bold
Section heading        : text-lg font-semibold
Body text              : text-sm / text-base font-normal
Caption / label kecil  : text-xs text-slate-500
```

---

## UI Flow

```
┌─────────────────────┐
│     [UPLOAD STATE]   │
│                     │
│  Logo + Tagline     │
│                     │
│  ┌───────────────┐  │
│  │  Foto Panduan │  │
│  │  (collapsed)  │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │  Drop/Upload  │  │
│  │  zona foto    │  │
│  └───────────────┘  │
│                     │
│  [Ada Es?] toggle   │
│                     │
│  [ANALISIS IKAN]    │
│       button        │
└─────────────────────┘
         │
         │ (loading spinner)
         ▼
┌─────────────────────┐
│    [RESULT STATE]   │
│                     │
│  ┌───────────────┐  │
│  │  TIER BADGE   │  │
│  │  [PRIMA] 98%  │  │
│  └───────────────┘  │
│                     │
│  Estimasi: >18 jam  │
│  Confidence bar     │
│                     │
│  [! Warning]        │  ← hanya jika confidence < 80%
│                     │
│  Rekomendasi:       │
│  "Kirim lintas..."  │
│                     │
│  Offtaker:          │
│  ┌───────────────┐  │
│  │ CV Maju Bahari│  │
│  │ Surabaya 45km │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ UD Segar Laut │  │
│  │ Sidoarjo 23km │  │
│  └───────────────┘  │
│                     │
│  [ANALISIS LAGI]    │
└─────────────────────┘
```

---

## Components

### 1. `PhotoUpload`
- Area drag-and-drop dengan border dashed
- Tampilkan preview foto setelah dipilih
- Tombol "Ganti Foto" setelah ada preview
- Accept: `image/jpeg, image/png, image/webp`
- Max size: 5MB (tampilkan error jika lebih)

### 2. `PhotoGuide`
- Collapsible section (default collapsed di mobile)
- 3 contoh: ✅ (1 ikan utuh, background bersih) vs ❌ (banyak ikan, blur, potongan)
- Teks singkat: "1 ikan utuh • Background bersih • Seluruh badan masuk frame"

### 3. `IceToggle`
- Toggle switch: "Ada Es?" default = ON (true)
- Jika OFF, tampilkan note kecil: "Tier akan disesuaikan otomatis"

### 4. `TierBadge`
```tsx
// Props
interface TierBadgeProps {
  tier: 'Tier3_Prima' | 'Tier2_Sedang' | 'Tier1_Kritis'
  confidence: number  // 0-1
}

// Tampilan
// [████ PRIMA ████]   ← full-width badge dengan warna tier
// Confidence: 98%
// Estimasi: > 18 jam
```

### 5. `ConfidenceBar`
- Progress bar horizontal 0-100%
- Warna berubah sesuai nilai (green/amber/red)
- Label: "Tingkat keyakinan model: 98%"

### 6. `LowConfidenceWarning`
- Tampil hanya jika `confidence < 0.80`
- Card kuning dengan icon ⚠️
- Teks: "Foto kurang jelas. Pastikan 1 ikan utuh di background bersih, seluruh badan masuk frame."

### 7. `IceDegradedNote`
- Tampil hanya jika `ice_degraded = true`
- Card biru info dengan icon ❄️
- Teks: "Tier disesuaikan karena ikan tidak disimpan dengan es."

### 8. `OfftakerList`
- List card vertikal
- Setiap card: nama offtaker, lokasi, jarak, nomor kontak
- Jarak diurutkan dari terdekat
- Jika Tier 1 (Kritis): tampilkan note merah "Segera proses atau jual lokal"

### 9. `LoadingState`
- Full overlay spinner di atas halaman
- Teks: "Menganalisis kondisi ikan..."
- Animasi: pulse atau spinner sederhana

---

## Responsive Breakpoints

```
Mobile (default) : max-width 430px — satu kolom, padding 16px
Tablet           : 768px+ — card lebih lebar, max-width 600px centered
Desktop          : 1024px+ — centered max-width 480px (tetap mobile-feel)
```

Layout di desktop tetap terasa seperti mobile karena target pengguna adalah HP.

---

## Loading & Error States

| State | Tampilan |
|---|---|
| Loading | Spinner + "Menganalisis kondisi ikan..." |
| Error AI down | Card merah "Sistem tidak tersedia. Coba beberapa saat lagi." |
| Error foto besar | Inline error di upload zone "Foto terlalu besar (max 5MB)" |
| Error format | Inline error "Format tidak didukung. Gunakan JPG atau PNG." |
| Sukses | Langsung tampilkan ResultCard tanpa modal |

---

## Accessibility

- Semua input punya label yang jelas
- Warna tidak jadi satu-satunya indikator (selalu ada teks)
- Touch target minimum 44×44px (sesuai WCAG)
- Contrast ratio minimum 4.5:1 untuk semua teks

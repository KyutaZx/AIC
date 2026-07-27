# Offtaker Pool — AquaRoute AI

## Overview

Tidak ada database di MVP. Data offtaker disimpan sebagai JSON hardcoded di `backend/offtaker_pool.json`. Backend membaca file ini saat startup dan menyimpannya di memory.

---

## Struktur JSON

```json
{
  "offtakers": [
    {
      "id": "off_001",
      "nama": "CV Maju Bahari",
      "lokasi": "Surabaya, Jawa Timur",
      "jarak_km": 45,
      "kontak": "081234567890",
      "tier_accepted": ["Tier2_Sedang", "Tier3_Prima"],
      "kapasitas_kg": 500,
      "keterangan": "Ekspor ke Singapura dan Malaysia"
    },
    {
      "id": "off_002",
      "nama": "UD Segar Laut",
      "lokasi": "Sidoarjo, Jawa Timur",
      "jarak_km": 23,
      "kontak": "082345678901",
      "tier_accepted": ["Tier1_Kritis", "Tier2_Sedang", "Tier3_Prima"],
      "kapasitas_kg": 200,
      "keterangan": "Pasar tradisional lokal, beli semua kondisi"
    },
    {
      "id": "off_003",
      "nama": "PT Nusantara Fish Hub",
      "lokasi": "Gresik, Jawa Timur",
      "jarak_km": 67,
      "kontak": "083456789012",
      "tier_accepted": ["Tier3_Prima"],
      "kapasitas_kg": 1000,
      "keterangan": "Hub distribusi lintas provinsi dan ekspor"
    },
    {
      "id": "off_004",
      "nama": "Koperasi Nelayan Mina Sejahtera",
      "lokasi": "Pasuruan, Jawa Timur",
      "jarak_km": 38,
      "kontak": "084567890123",
      "tier_accepted": ["Tier2_Sedang", "Tier3_Prima"],
      "kapasitas_kg": 300,
      "keterangan": "Pasar regional antarkabupaten"
    },
    {
      "id": "off_005",
      "nama": "Pabrik Pindang Pak Slamet",
      "lokasi": "Bangil, Jawa Timur",
      "jarak_km": 31,
      "kontak": "085678901234",
      "tier_accepted": ["Tier1_Kritis"],
      "kapasitas_kg": 150,
      "keterangan": "Pengolahan pindang dan ikan asin"
    },
    {
      "id": "off_006",
      "nama": "Pasar Ikan TPI Brondong",
      "lokasi": "Lamongan, Jawa Timur",
      "jarak_km": 12,
      "kontak": "086789012345",
      "tier_accepted": ["Tier1_Kritis", "Tier2_Sedang"],
      "kapasitas_kg": 100,
      "keterangan": "Jual cepat lokal, tidak perlu transport jauh"
    }
  ]
}
```

---

## Field Schema

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | Unique identifier, format `off_XXX` |
| `nama` | string | Nama perusahaan/koperasi/individu |
| `lokasi` | string | Kota, Provinsi |
| `jarak_km` | int | Jarak estimasi dari TPI referensi (mock) |
| `kontak` | string | Nomor HP (format Indonesia) |
| `tier_accepted` | []string | Tier yang diterima offtaker ini |
| `kapasitas_kg` | int | Kapasitas beli per trip (mock) |
| `keterangan` | string | Deskripsi singkat jenis offtaker |

---

## Business Logic di Backend

### 1. Filter by Tier
Setelah mendapat Tier final (sudah melewati business rule `has_ice`), backend filter offtaker yang `tier_accepted` mengandung Tier tersebut.

```go
// Pseudocode
func filterOfftakerByTier(offtakers []Offtaker, tier string) []Offtaker {
    var result []Offtaker
    for _, o := range offtakers {
        for _, t := range o.TierAccepted {
            if t == tier {
                result = append(result, o)
                break
            }
        }
    }
    return result
}
```

### 2. Sort by Jarak
Hasil filter diurutkan dari jarak terdekat ke terjauh.

```go
sort.Slice(filtered, func(i, j int) bool {
    return filtered[i].JarakKm < filtered[j].JarakKm
})
```

### 3. Business Rule: has_ice
Jika `has_ice = false` dari request Frontend:

```
Tier3_Prima  → turun jadi Tier2_Sedang
Tier2_Sedang → turun jadi Tier1_Kritis
Tier1_Kritis → tetap Tier1_Kritis
```

Field `ice_degraded: true` ditambahkan ke response jika terjadi degradasi.

---

## Tier Metadata (untuk Response Frontend)

```go
var tierMeta = map[string]TierMeta{
    "Tier3_Prima": {
        Label:          "PRIMA",
        EstimasiWaktu:  "> 18 jam",
        Rekomendasi:    "Kirim lintas provinsi atau ke hub ekspor",
        Color:          "green",
    },
    "Tier2_Sedang": {
        Label:          "SEDANG",
        EstimasiWaktu:  "6–18 jam",
        Rekomendasi:    "Kirim ke pasar regional antarkabupaten",
        Color:          "amber",
    },
    "Tier1_Kritis": {
        Label:          "KRITIS",
        EstimasiWaktu:  "< 6 jam",
        Rekomendasi:    "Jual lokal sekarang atau olah jadi pindang/ikan asin",
        Color:          "red",
    },
}
```

---

## Catatan untuk Juri

Data offtaker ini adalah **mock data** untuk keperluan demo MVP. Dalam implementasi produksi, data ini akan berasal dari database yang terhubung ke sistem registrasi offtaker nyata. Integrasi Maps API untuk jarak real-time adalah roadmap pasca-MVP.

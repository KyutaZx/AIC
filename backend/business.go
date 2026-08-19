package main

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"sort"
)

// Offtaker represents one entry from offtaker_pool.json.
type Offtaker struct {
	ID           string   `json:"id"`
	Nama         string   `json:"nama"`
	Lokasi       string   `json:"lokasi"`
	Lat          float64  `json:"lat"`
	Lng          float64  `json:"lng"`
	JarakKm      int      `json:"jarak_km"`
	Kontak       string   `json:"kontak"`
	TierAccepted []string `json:"tier_accepted"`
	KapasitasKg  int      `json:"kapasitas_kg"`
	Keterangan   string   `json:"keterangan"`
}

// RankedOfftaker pairs an offtaker with its display distance ("X.X km" real
// or "X km" static fallback), ready to be sent to the frontend.
type RankedOfftaker struct {
	Offtaker
	Jarak string
}

type offtakerPool struct {
	Offtakers []Offtaker `json:"offtakers"`
}

// TierMeta holds the display metadata for a final tier.
type TierMeta struct {
	Label         string
	EstimasiWaktu string
	Rekomendasi   string
	Color         string
}

var tierMeta = map[string]TierMeta{
	"Tier3_Prima": {
		Label:         "PRIMA",
		EstimasiWaktu: "> 18 jam",
		Rekomendasi:   "Kirim lintas provinsi atau ke hub ekspor",
		Color:         "green",
	},
	"Tier2_Sedang": {
		Label:         "SEDANG",
		EstimasiWaktu: "6–18 jam",
		Rekomendasi:   "Kirim ke pasar regional antarkabupaten",
		Color:         "amber",
	},
	"Tier1_Kritis": {
		Label:         "KRITIS",
		EstimasiWaktu: "< 6 jam",
		Rekomendasi:   "Jual lokal sekarang atau olah jadi pindang/ikan asin",
		Color:         "red",
	},
}

// sniIndikator maps each final tier to its textual explanation based on
// SNI 2729:2013 "Ikan Segar", Lampiran A (normatif) — Lembar Penilaian
// Organoleptik Ikan Segar (BSN). SNI 2729:2013 requires a minimum organoleptic
// score of 7 (scale 1-9) for a fish to be officially considered "ikan segar"
// (Tabel 1, persyaratan mutu dan keamanan). Text below is a direct quote from
// Lampiran A — do not alter its substance.
var sniIndikator = map[string]string{
	"Tier3_Prima":  "Setara skor organoleptik SNI 8-9 (dari 9, syarat minimum SNI 2729:2013 adalah 7). Mata: bola mata cembung/rata, kornea dan pupil jernih, mengkilap spesifik jenis ikan. Insang: warna merah tua/coklat kemerahan, cemerlang, sedikit lendir transparan. Daging: sayatan sangat cemerlang, jaringan kuat. Bau: sangat segar spesifik jenis. Tekstur: padat, kompak, sangat elastis.",
	"Tier2_Sedang": "Setara skor organoleptik SNI 6-7 (mendekati batas minimum mutu SNI 2729:2013, yaitu skor 7). Mata: bola mata agak cekung, kornea agak keruh, pupil agak keabu-abuan. Insang: warna merah muda/coklat muda, lendir agak keruh. Daging: sedikit kurang cemerlang, jaringan sedikit kurang kuat. Bau: segar berkurang hingga netral. Tekstur: agak lunak, agak elastis.",
	"Tier1_Kritis": "Setara skor organoleptik SNI 1-5 (di bawah ambang batas minimum mutu SNI 2729:2013, yaitu skor 7). Mata: bola mata cekung hingga sangat cekung, kornea keruh, pupil keabu-abuan. Insang: warna abu-abu/coklat keabuan, lendir putih/coklat menggumpal. Daging: kusam hingga sangat kusam, jaringan rusak. Bau: asam hingga busuk. Tekstur: lunak, bekas jari tidak hilang.",
}

// loadOfftakers reads and parses the hardcoded offtaker pool from disk.
func loadOfftakers(path string) ([]Offtaker, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var pool offtakerPool
	if err := json.Unmarshal(data, &pool); err != nil {
		return nil, err
	}

	return pool.Offtakers, nil
}

// applyIceDegradation degrades the tier one step when has_ice is false.
// Tier3_Prima -> Tier2_Sedang -> Tier1_Kritis. Tier1_Kritis stays as-is.
func applyIceDegradation(tier string, hasIce bool) (finalTier string, degraded bool) {
	if hasIce {
		return tier, false
	}

	switch tier {
	case "Tier3_Prima":
		return "Tier2_Sedang", true
	case "Tier2_Sedang":
		return "Tier1_Kritis", true
	default:
		return tier, false
	}
}

// filterOfftakersByTier returns offtakers that accept the given tier,
// sorted by jarak_km ascending (nearest first).
func filterOfftakersByTier(offtakers []Offtaker, tier string) []Offtaker {
	result := []Offtaker{}
	for _, o := range offtakers {
		for _, t := range o.TierAccepted {
			if t == tier {
				result = append(result, o)
				break
			}
		}
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].JarakKm < result[j].JarakKm
	})

	return result
}

// haversineDistance returns the great-circle distance in kilometers between two
// points given in decimal degrees. Pure math, no external API.
func haversineDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const earthRadiusKm = 6371.0

	dLat := (lat2 - lat1) * math.Pi / 180
	dLng := (lng2 - lng1) * math.Pi / 180
	rLat1 := lat1 * math.Pi / 180
	rLat2 := lat2 * math.Pi / 180

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(rLat1)*math.Cos(rLat2)*math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadiusKm * c
}

// rankOfftakers attaches a display distance to each offtaker and sorts nearest
// first. When userLat/userLng are provided (user granted browser geolocation),
// distance is computed live via haversine and formatted "X.X km". Otherwise it
// falls back to the static jarak_km from offtaker_pool.json formatted "X km".
// The returned bool reports whether the distances are real (location-based).
func rankOfftakers(offtakers []Offtaker, userLat, userLng *float64) ([]RankedOfftaker, bool) {
	useReal := userLat != nil && userLng != nil

	type entry struct {
		ranked RankedOfftaker
		dist   float64
	}

	entries := make([]entry, 0, len(offtakers))
	for _, o := range offtakers {
		var dist float64
		var jarak string
		if useReal {
			dist = haversineDistance(*userLat, *userLng, o.Lat, o.Lng)
			jarak = fmt.Sprintf("%.1f km", dist)
		} else {
			dist = float64(o.JarakKm)
			jarak = fmt.Sprintf("%d km", o.JarakKm)
		}
		entries = append(entries, entry{
			ranked: RankedOfftaker{Offtaker: o, Jarak: jarak},
			dist:   dist,
		})
	}

	sort.SliceStable(entries, func(i, j int) bool {
		return entries[i].dist < entries[j].dist
	})

	result := make([]RankedOfftaker, 0, len(entries))
	for _, e := range entries {
		result = append(result, e.ranked)
	}

	return result, useReal
}

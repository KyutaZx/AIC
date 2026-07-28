package main

import (
	"encoding/json"
	"os"
	"sort"
)

// Offtaker represents one entry from offtaker_pool.json.
type Offtaker struct {
	ID           string   `json:"id"`
	Nama         string   `json:"nama"`
	Lokasi       string   `json:"lokasi"`
	JarakKm      int      `json:"jarak_km"`
	Kontak       string   `json:"kontak"`
	TierAccepted []string `json:"tier_accepted"`
	KapasitasKg  int      `json:"kapasitas_kg"`
	Keterangan   string   `json:"keterangan"`
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

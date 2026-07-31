const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface Offtaker {
  nama: string;
  lokasi: string;
  jarak_km: number;
  kontak: string;
  tier_accepted: string[];
}

export interface PredictSuccess {
  success: true;
  tier: 'Tier3_Prima' | 'Tier2_Sedang' | 'Tier1_Kritis';
  tier_label: string;
  confidence: number;
  estimasi_sisa_jam: string;
  rekomendasi: string;
  low_confidence_warning: boolean;
  ice_degraded: boolean;
  sni_indikator: string;
  heatmap_base64: string;
  offtakers: Offtaker[];
}

export interface PredictError {
  success: false;
  error: string;
  code: string;
}

export type PredictResponse = PredictSuccess | PredictError;

export interface PredictParams {
  imageBase64: string;
  hasIce: boolean;
  jamSejakTangkap: number | null;
}

export async function predictFish(params: PredictParams): Promise<PredictResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_base64: params.imageBase64,
        has_ice: params.hasIce,
        jam_sejak_tangkap: params.jamSejakTangkap,
      }),
    });

    const data = (await res.json()) as PredictResponse;
    return data;
  } catch {
    return {
      success: false,
      error: 'Sistem tidak tersedia. Coba beberapa saat lagi.',
      code: 'NETWORK_ERROR',
    };
  }
}

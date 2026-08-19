const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface Offtaker {
  nama: string;
  lokasi: string;
  // Formatted distance string, e.g. "12.3 km" (real, from user location) or
  // "12 km" (static fallback). The backend decides which based on user_lat/lng.
  jarak: string;
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
  // true when offtaker distances were computed from the user's real location.
  jarak_real: boolean;
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
  // Optional: sent only when the browser granted geolocation. When present the
  // backend computes real offtaker distances via haversine; otherwise it falls
  // back to the static distances in offtaker_pool.json.
  userLat?: number;
  userLng?: number;
}

// getBrowserLocation resolves with the user's coordinates when geolocation is
// available and the user grants permission. On any failure — unsupported,
// denied, or timeout — it resolves with null so the caller can proceed with the
// static-distance fallback instead of blocking the main flow.
export function getBrowserLocation(
  timeoutMs = 5000,
): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 60000 },
    );
  });
}

export async function predictFish(params: PredictParams): Promise<PredictResponse> {
  try {
    const body: Record<string, unknown> = {
      image_base64: params.imageBase64,
      has_ice: params.hasIce,
    };
    if (params.userLat !== undefined && params.userLng !== undefined) {
      body.user_lat = params.userLat;
      body.user_lng = params.userLng;
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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

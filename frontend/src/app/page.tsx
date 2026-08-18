'use client';

import { useState } from 'react';
import { AlertCircle, Fish, Navigation } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoGuide from '@/components/PhotoGuide';
import IceToggle from '@/components/IceToggle';
import TierBadge from '@/components/TierBadge';
import ConfidenceBar from '@/components/ConfidenceBar';
import HeatmapOverlay from '@/components/HeatmapOverlay';
import SNIIndicator from '@/components/SNIIndicator';
import LowConfidenceWarning from '@/components/LowConfidenceWarning';
import IceDegradedNote from '@/components/IceDegradedNote';
import OfftakerList from '@/components/OfftakerList';
import LoadingState from '@/components/LoadingState';
import { predictFish, getBrowserLocation, type PredictSuccess } from '@/lib/api';

const TIER_ACCENT: Record<string, string> = {
  Tier3_Prima: 'border-l-green-600',
  Tier2_Sedang: 'border-l-amber-600',
  Tier1_Kritis: 'border-l-red-600',
};

export default function Home() {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [hasIce, setHasIce] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictSuccess | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!photoBase64) {
      setErrorMessage('Pilih foto ikan terlebih dahulu.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    // Try the browser location first; on denial/timeout this resolves to null
    // and we submit without coordinates (backend uses static-distance fallback).
    const location = await getBrowserLocation();

    const response = await predictFish({
      imageBase64: photoBase64,
      hasIce,
      userLat: location?.lat,
      userLng: location?.lng,
    });

    setLoading(false);

    if (!response.success) {
      setErrorMessage(response.error || 'Sistem tidak tersedia. Coba beberapa saat lagi.');
      return;
    }

    setResult(response);
  }

  function handleReset() {
    setResult(null);
    setPhotoBase64(null);
    setErrorMessage(null);
    setHasIce(true);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[430px] px-4 py-6 sm:max-w-[600px] lg:max-w-[480px]">
      {loading && <LoadingState />}

      <header className="mb-6 flex flex-col items-center gap-1 border-b border-slate-200/80 pb-5 text-center">
        <div className="flex items-center gap-2">
          <Fish className="h-6 w-6 text-sky-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-slate-900">AquaRoute AI</h1>
        </div>
        <p className="text-sm text-slate-500">Distribusi ikan berbasis kondisi, bukan tebakan</p>
      </header>

      {result ? (
        <section className="space-y-6">
          <TierBadge
            tier={result.tier}
            confidence={result.confidence}
            estimasiSisaJam={result.estimasi_sisa_jam}
          />
          <ConfidenceBar confidence={result.confidence} />
          {result.low_confidence_warning && <LowConfidenceWarning />}
          {result.ice_degraded && <IceDegradedNote />}
          <HeatmapOverlay heatmapBase64={result.heatmap_base64} />
          <SNIIndicator sniIndikator={result.sni_indikator} />
          <div
            className={`flex items-start gap-3 rounded-2xl border border-slate-200/80 border-l-4 bg-white p-4 shadow-sm ${
              TIER_ACCENT[result.tier] ?? 'border-l-slate-400'
            }`}
          >
            <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Rekomendasi</h2>
              <p className="mt-1 text-sm text-slate-900">{result.rekomendasi}</p>
            </div>
          </div>
          <OfftakerList
            offtakers={result.offtakers}
            tier={result.tier}
            jarakReal={result.jarak_real}
          />
          <button
            type="button"
            onClick={handleReset}
            className="h-11 w-full rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Analisis Lagi
          </button>
        </section>
      ) : (
        <section className="space-y-6">
          <PhotoGuide />
          <PhotoUpload onPhotoSelected={setPhotoBase64} />
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Kondisi Ikan</h2>
            <IceToggle checked={hasIce} onChange={setHasIce} />
          </div>
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 shadow-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
              <p className="text-sm text-slate-900">{errorMessage}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!photoBase64 || loading}
            className="h-11 w-full rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-sky-600 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Analisis Ikan
          </button>
        </section>
      )}
    </main>
  );
}

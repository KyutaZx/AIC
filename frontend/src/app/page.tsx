'use client';

import { useState } from 'react';
import { ArrowLeft, AlertCircle, Navigation } from 'lucide-react';

import Logo from '@/components/Logo';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoGuide from '@/components/PhotoGuide';
import IceToggle from '@/components/IceToggle';
import LoadingState from '@/components/LoadingState';
import TierBadge from '@/components/TierBadge';
import ConfidenceBar from '@/components/ConfidenceBar';
import HeatmapOverlay from '@/components/HeatmapOverlay';
import SNIIndicator from '@/components/SNIIndicator';
import LowConfidenceWarning from '@/components/LowConfidenceWarning';
import IceDegradedNote from '@/components/IceDegradedNote';
import OfftakerList from '@/components/OfftakerList';
import { predictFish, getBrowserLocation, type PredictSuccess } from '@/lib/api';

export default function RootPage() {
  const [view, setView] = useState<'upload' | 'loading' | 'result'>('upload');

  // Analisis State
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [hasIce, setHasIce] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result State
  const [result, setResult] = useState<PredictSuccess | null>(null);

  async function handleSubmit() {
    if (!photoBase64) {
      setErrorMessage('Pilih foto ikan terlebih dahulu.');
      return;
    }
    setErrorMessage(null);
    setView('loading'); // Tampilkan animasi air

    // Coba ambil lokasi browser dulu; kalau ditolak/timeout resolusinya null
    // dan kita submit tanpa koordinat (backend pakai fallback jarak statis).
    const location = await getBrowserLocation();

    // Jalankan API dan minimum timer 3.5 detik secara bersamaan
    const [response] = await Promise.all([
      predictFish({
        imageBase64: photoBase64,
        hasIce,
        userLat: location?.lat,
        userLng: location?.lng,
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 3500)),
    ]);

    if (!response.success) {
      setView('upload');
      setErrorMessage(response.error || 'Sistem tidak tersedia. Coba beberapa saat lagi.');
      return;
    }

    setResult(response);
    setView('result');
  }

  function handleReset() {
    setView('upload');
    setPhotoBase64(null);
    setHasIce(true);
    setResult(null);
    setErrorMessage(null);
  }

  if (view === 'result' && result) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[430px] bg-white pb-10 sm:max-w-[600px] lg:max-w-[480px]">
        {/* ── Header Result ── */}
        <header className="sticky top-0 z-10 border-b border-[#E0E6FF] bg-white/95 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E0E6FF] bg-[#F5F7FF] text-[#0000FF] transition-colors hover:bg-[#E0E6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF]"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-base font-black text-[#0A0A1A]">Hasil Analisis</h1>
          </div>
        </header>

        <div className="animate-fade-in space-y-4 px-4 pt-5">
          {/* ── Tier Badge (big hero card) ── */}
          <TierBadge
            tier={result.tier}
            confidence={result.confidence}
            estimasiSisaJam={result.estimasi_sisa_jam}
          />

          {/* ── Confidence bar ── */}
          <div className="card-freshco p-4">
            <ConfidenceBar confidence={result.confidence} />
          </div>

          {/* ── Warnings ── */}
          {result.low_confidence_warning && <LowConfidenceWarning />}
          {result.ice_degraded && <IceDegradedNote />}

          {/* ── Heatmap AI ── */}
          <HeatmapOverlay heatmapBase64={result.heatmap_base64} />

          {/* ── SNI Indicator ── */}
          <SNIIndicator sniIndikator={result.sni_indikator} />

          {/* ── Recommendation card ── */}
          <div className="card-freshco flex items-start gap-3 p-4">
            <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-[#0000FF]" aria-hidden="true" />
            <div>
              <h2 className="text-base font-bold text-[#0A0A1A]">Rekomendasi</h2>
              <p className="mt-1 text-sm text-[#4B5563]">{result.rekomendasi}</p>
            </div>
          </div>

          {/* ── Offtakers ── */}
          <OfftakerList
            offtakers={result.offtakers}
            tier={result.tier}
            jarakReal={result.jarak_real}
          />

          {/* ── Reset CTA ── */}
          <button
            type="button"
            onClick={handleReset}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#0000FF] text-base font-bold text-white transition-colors hover:bg-[#0000CC] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-offset-2"
          >
            Analisis Ikan Baru
          </button>
        </div>
      </main>
    );
  }

  // Loading View — animasi air naik
  if (view === 'loading') {
    return <LoadingState />;
  }

  // Upload View
  return (
    <main className="mx-auto min-h-screen w-full max-w-[430px] bg-white pb-10 sm:max-w-[600px] lg:max-w-[480px]">

      {/* Header Upload */}
      <header className="sticky top-0 z-10 border-b border-[#E0E6FF] bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-center">
          <Logo className="h-8 w-auto" />
        </div>
      </header>

      <div className="space-y-5 px-4 pt-5">
        {/* Photo Guide — di atas upload */}
        <PhotoGuide />

        {/* Foto section */}
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-black text-[#0A0A1A]">Foto Ikan</h2>
          </div>
          <PhotoUpload onPhotoSelected={setPhotoBase64} />
        </div>

        {/* Kondisi section */}
        <div>
          <h2 className="mb-3 text-lg font-black text-[#0A0A1A]">Kondisi Ikan</h2>
          <IceToggle checked={hasIce} onChange={setHasIce} />
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-sm text-[#0A0A1A]">{errorMessage}</p>
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!photoBase64}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#0000FF] text-base font-bold text-white transition-all hover:bg-[#0000CC] active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-[#0000FF] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-offset-2"
        >
          Analisis Ikan
        </button>
      </div>
    </main>
  );
}

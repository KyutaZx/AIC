'use client';

import { useState } from 'react';
import { ChevronDown, ScanEye } from 'lucide-react';

interface HeatmapOverlayProps {
  heatmapBase64: string;
}

export default function HeatmapOverlay({ heatmapBase64 }: HeatmapOverlayProps) {
  const [open, setOpen] = useState(false);

  if (!heatmapBase64) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <ScanEye className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="flex-1 text-sm font-semibold text-slate-900">
          Lihat Area yang Dianalisis AI
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="border-t border-slate-200/80 p-4">
          <img
            src={`data:image/jpeg;base64,${heatmapBase64}`}
            alt="Heatmap Grad-CAM area yang diperhatikan model saat menilai kondisi ikan"
            className="mx-auto w-full max-w-[240px] rounded-xl"
          />
          <p className="mt-3 text-xs text-slate-500">
            Area yang lebih merah menunjukkan bagian foto yang paling memengaruhi keputusan model.
          </p>
        </div>
      )}
    </div>
  );
}

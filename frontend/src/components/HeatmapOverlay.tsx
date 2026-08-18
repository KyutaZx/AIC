'use client';

import { ScanEye } from 'lucide-react';

interface HeatmapOverlayProps {
  heatmapBase64: string;
}

export default function HeatmapOverlay({ heatmapBase64 }: HeatmapOverlayProps) {
  if (!heatmapBase64) return null;

  return (
    <div className="card-freshco overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[#E0E6FF] p-3">
        <ScanEye className="h-4 w-4 shrink-0 text-[#0000FF]" aria-hidden="true" />
        <span className="text-sm font-bold text-[#0A0A1A]">
          Area yang Dianalisis AI
        </span>
      </div>

      <div className="p-4">
        <img
          src={`data:image/jpeg;base64,${heatmapBase64}`}
          alt="Heatmap Grad-CAM area yang diperhatikan model saat menilai kondisi ikan"
          className="mx-auto w-full max-w-[240px] rounded-xl"
        />
        <p className="mt-3 text-center text-xs text-[#4B5563]">
          Area yang lebih merah menunjukkan bagian foto yang paling memengaruhi keputusan model.
        </p>
      </div>
    </div>
  );
}

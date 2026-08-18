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
 <div className="card-freshco overflow-hidden">
 <button
 type="button"
 onClick={() => setOpen((v) => !v)}
 aria-expanded={open}
 className="flex w-full items-center gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-inset"
 >
 <ScanEye className="h-5 w-5 shrink-0 text-[#0000FF]" aria-hidden="true" />
 <span className="flex-1 text-sm font-bold text-[#0A0A1A]">
 Lihat Area yang Dianalisis AI
 </span>
 <ChevronDown
 className={`h-5 w-5 shrink-0 text-[#4B5563] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
 aria-hidden="true"
 />
 </button>

 {open && (
 <div className="border-t border-[#E0E6FF] p-4">
 <img
 src={`data:image/jpeg;base64,${heatmapBase64}`}
 alt="Heatmap Grad-CAM area yang diperhatikan model saat menilai kondisi ikan"
 className="mx-auto w-full max-w-[240px] rounded-xl"
 />
 <p className="mt-3 text-center text-xs text-[#4B5563]">
 Area yang lebih merah menunjukkan bagian foto yang paling memengaruhi keputusan model.
 </p>
 </div>
 )}
 </div>
 );
}

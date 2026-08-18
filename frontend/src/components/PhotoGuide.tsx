'use client';

import { CheckCircle2, XCircle, Camera } from 'lucide-react';

export default function PhotoGuide() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0000FF] px-4 py-4">
      {/* Animated gradient blob background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#3333FF] opacity-60 animate-pulse" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#0000CC] opacity-70 animate-pulse [animation-delay:0.7s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-[#2222EE] opacity-40 animate-pulse [animation-delay:1.2s]" />
        {/* Shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
      </div>

      {/* Header */}
      <div className="relative mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
          <Camera className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold text-white">Panduan Foto</p>
      </div>

      {/* Rules */}
      <div className="relative space-y-2 text-sm">
        <p className="flex items-center gap-2 font-semibold text-white">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ADE80]" strokeWidth={2.5} aria-hidden="true" />
          1 ikan utuh, background bersih
        </p>
        <p className="flex items-center gap-2 font-semibold text-white">
          <XCircle className="h-4 w-4 shrink-0 text-[#F87171]" strokeWidth={2.5} aria-hidden="true" />
          Banyak ikan, blur, atau terpotong
        </p>
        <p className="text-white text-xs pt-1 opacity-80">
          1 ikan utuh &bull; Background bersih &bull; Seluruh badan masuk frame
        </p>
      </div>
    </div>
  );
}

'use client';

export default function LoadingState() {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white">

      {/* ── Water block that rises from the bottom ── */}
      <div className="absolute inset-x-0 bottom-0 h-full animate-[water-rise_3s_ease-in-out_forwards]">
        {/* Wave SVG at the very top of the water */}
        <div className="absolute -top-[39px] left-0 w-[200%] animate-[wave-scroll_3s_linear_infinite]">
          <svg
            viewBox="0 0 1440 40"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 C180,40 360,0 540,20 C720,40 900,0 1080,20 C1260,40 1440,0 1440,20 L1440,40 L0,40 Z"
              fill="#0000FF"
            />
          </svg>
        </div>
        {/* Solid blue fill below the wave */}
        <div className="absolute inset-0 top-[1px] bg-[#0000FF]" />
      </div>

      {/* ── Animated blobs inside the water ── */}
      <div className="absolute inset-0 pointer-events-none animate-[fade-in-up_1.8s_ease_forwards]">
        <div className="absolute right-8 top-1/3 h-32 w-32 rounded-full bg-[#3333FF] opacity-40 animate-pulse" />
        <div className="absolute left-4 bottom-1/4 h-20 w-20 rounded-full bg-[#0000CC] opacity-50 animate-pulse [animation-delay:0.6s]" />
      </div>

      {/* ── Centered content (logo + text) ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 animate-[fade-in-up_0.8s_ease_3s_both]">
        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-bold text-white tracking-wide">Menganalisis Ikan...</p>
          <p className="text-xs text-white/70">Model AI sedang memproses foto Anda</p>
        </div>
        {/* Animated dots */}
        <div className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:0s]" />
          <span className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:0.15s]" />
          <span className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:0.3s]" />
        </div>
      </div>

    </div>
  );
}

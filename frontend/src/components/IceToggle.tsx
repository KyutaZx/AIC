'use client';

import { Snowflake } from 'lucide-react';

interface IceToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function IceToggle({ checked, onChange }: IceToggleProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0000FF] p-3 flex flex-col items-center gap-2.5">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#3333FF] opacity-60 animate-pulse" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-[#0000CC] opacity-70 animate-pulse [animation-delay:0.8s]" />

      {/* Label */}
      <label className="relative flex items-center gap-1.5 text-sm font-semibold text-white">
        <Snowflake className="h-4 w-4 text-[#93C5FD]" aria-hidden="true" />
        Ada Es?
      </label>

      {/* Info kecil */}
      <p className="relative text-center text-[10px] leading-snug text-white/70">
        Es menjaga suhu ikan &amp; memperlambat pembusukan.
      </p>

      {/* Segmented pill control */}
      <div className="relative flex w-full rounded-xl border-2 border-white/30 bg-white p-1">
        {/* Sliding background indicator */}
        <span
          aria-hidden="true"
          className={`absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg transition-all duration-300 ease-in-out ${
            checked
              ? 'left-1 bg-[#16A34A]'
              : 'left-[calc(50%+2px)] bg-[#DC2626]'
          }`}
        />

        {/* Iya */}
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`relative z-10 flex-1 rounded-lg py-2 text-sm font-bold transition-colors duration-300 ${
            checked ? 'text-white' : 'text-[#1E3A8A]'
          }`}
        >
          Iya
        </button>

        {/* Tidak */}
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`relative z-10 flex-1 rounded-lg py-2 text-sm font-bold transition-colors duration-300 ${
            !checked ? 'text-white' : 'text-[#1E3A8A]'
          }`}
        >
          Tidak
        </button>
      </div>
    </div>
  );
}

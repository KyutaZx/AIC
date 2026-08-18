'use client';

import { Clock } from 'lucide-react';

interface JamInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JamInput({ value, onChange }: JamInputProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0000FF] p-3">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#3333FF] opacity-60 animate-pulse [animation-delay:0.4s]" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-[#0000CC] opacity-70 animate-pulse [animation-delay:1s]" />

      <div className="relative">
        <label htmlFor="jam-input" className="text-sm font-semibold text-white">
          Jam sejak tangkap{' '}
          <span className="font-normal text-white/60">(opsional)</span>
        </label>
        <div className="relative mt-2">
          <Clock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93C5FD]"
            aria-hidden="true"
          />
          <input
            id="jam-input"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="contoh: 4"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/40 bg-white pl-9 pr-3 text-sm text-[#1E3A8A] placeholder:text-[#93C5FD] transition-colors focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { Clock } from 'lucide-react';

interface JamInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JamInput({ value, onChange }: JamInputProps) {
  return (
    <div>
      <label htmlFor="jam-input" className="text-sm font-medium text-slate-900">
        Berapa jam sejak ditangkap? (opsional)
      </label>
      <div className="relative mt-1">
        <Clock
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-base text-slate-900 transition-colors focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
        />
      </div>
    </div>
  );
}

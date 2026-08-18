'use client';

import { Clock } from 'lucide-react';

interface JamInputProps {
 value: string;
 onChange: (value: string) => void;
}

export default function JamInput({ value, onChange }: JamInputProps) {
 return (
 <div>
 <label htmlFor="jam-input" className="text-sm font-semibold text-[#0A0A1A]">
 Berapa jam sejak ditangkap? <span className="font-normal text-[#4B5563]">(opsional)</span>
 </label>
 <div className="relative mt-1.5">
 <Clock
 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4B5563]"
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
 className="h-11 w-full rounded-xl border border-[#E0E6FF] bg-white pl-9 pr-3 text-base text-[#0A0A1A] placeholder:text-[#4B5563]/50 transition-colors focus:border-[#0000FF] focus:outline-none focus:ring-2 focus:ring-[#0000FF]/20"
 />
 </div>
 </div>
 );
}

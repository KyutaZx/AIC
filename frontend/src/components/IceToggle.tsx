'use client';

import { Snowflake } from 'lucide-react';

interface IceToggleProps {
 checked: boolean;
 onChange: (checked: boolean) => void;
}

export default function IceToggle({ checked, onChange }: IceToggleProps) {
 return (
 <div>
 <div className="flex items-center justify-between gap-3">
 <label htmlFor="ice-toggle" className="flex items-center gap-2 text-sm font-semibold text-[#0A0A1A]">
 <Snowflake className="h-4 w-4 text-[#0000FF]" aria-hidden="true" />
 Ada Es?
 </label>
 <button
 id="ice-toggle"
 type="button"
 role="switch"
 aria-checked={checked}
 onClick={() => onChange(!checked)}
 className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-offset-2 ${
 checked ? 'bg-[#0000FF]' : 'bg-[#E0E6FF]'
 }`}
 >
 <span
 className={`inline-block h-5 w-5 transform rounded-full bg-white ring-1 ring-black/5 transition-transform ${
 checked ? 'translate-x-6' : 'translate-x-1'
 }`}
 />
 </button>
 </div>
 {!checked && (
 <p className="mt-1 text-xs text-[#4B5563]">Tier akan disesuaikan otomatis</p>
 )}
 </div>
 );
}

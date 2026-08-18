'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, XCircle } from 'lucide-react';

export default function PhotoGuide() {
 const [open, setOpen] = useState(false);

 return (
 <div className="card-freshco overflow-hidden">
 <button
 type="button"
 onClick={() => setOpen((value) => !value)}
 aria-expanded={open}
 className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-inset"
 >
 <span className="text-sm font-bold text-[#0A0A1A]">Panduan Foto</span>
 <ChevronDown
 className={`h-4 w-4 text-[#4B5563] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
 aria-hidden="true"
 />
 </button>
 {open && (
 <div className="space-y-2.5 border-t border-[#E0E6FF] px-4 py-3 text-sm">
 <p className="flex items-center gap-2 font-medium text-green-700">
 <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
 1 ikan utuh, background bersih
 </p>
 <p className="flex items-center gap-2 font-medium text-red-600">
 <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
 Banyak ikan, blur, atau terpotong
 </p>
 <p className="text-[#4B5563]">
 1 ikan utuh &bull; Background bersih &bull; Seluruh badan masuk frame
 </p>
 </div>
 )}
 </div>
 );
}

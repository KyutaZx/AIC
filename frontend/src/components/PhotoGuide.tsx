'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, XCircle } from 'lucide-react';

export default function PhotoGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">Panduan Foto</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="space-y-2 border-t border-slate-100 px-4 py-3 text-sm">
          <p className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            1 ikan utuh, background bersih
          </p>
          <p className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Banyak ikan, blur, atau terpotong
          </p>
          <p className="text-slate-500">
            1 ikan utuh &bull; Background bersih &bull; Seluruh badan masuk frame
          </p>
        </div>
      )}
    </div>
  );
}

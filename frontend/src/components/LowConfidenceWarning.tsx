import { AlertTriangle } from 'lucide-react';

export default function LowConfidenceWarning() {
 return (
 <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
 <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
 <div>
 <p className="text-sm font-semibold text-amber-800">Foto kurang jelas</p>
 <p className="mt-0.5 text-sm text-[#0A0A1A]">
 Pastikan 1 ikan utuh di background bersih, seluruh badan masuk frame, dan pencahayaan cukup.
 </p>
 </div>
 </div>
 );
}

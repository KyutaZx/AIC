import { AlertTriangle } from 'lucide-react';

export default function LowConfidenceWarning() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
      <p className="text-sm text-slate-900">
        Foto kurang jelas. Pastikan 1 ikan utuh di background bersih, seluruh badan masuk frame.
      </p>
    </div>
  );
}

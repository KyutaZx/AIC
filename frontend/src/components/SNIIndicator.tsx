import { ClipboardCheck } from 'lucide-react';

interface SNIIndicatorProps {
  sniIndikator: string;
}

export default function SNIIndicator({ sniIndikator }: SNIIndicatorProps) {
  if (!sniIndikator) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Berdasarkan SNI 2729:2013 &ndash; Lembar Penilaian Organoleptik Ikan Segar
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{sniIndikator}</p>
      </div>
    </div>
  );
}

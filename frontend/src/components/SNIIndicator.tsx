import { ClipboardCheck } from 'lucide-react';

interface SNIIndicatorProps {
 sniIndikator: string;
}

export default function SNIIndicator({ sniIndikator }: SNIIndicatorProps) {
 if (!sniIndikator) return null;

 return (
 <div className="card-freshco flex items-start gap-3 p-4">
 <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0000FF]" aria-hidden="true" />
 <div>
 <h2 className="text-sm font-bold text-[#0A0A1A]">
 Berdasarkan SNI 2729:2013 &ndash; Lembar Penilaian Organoleptik Ikan Segar
 </h2>
 <p className="mt-1 text-sm leading-relaxed text-[#4B5563]">{sniIndikator}</p>
 </div>
 </div>
 );
}

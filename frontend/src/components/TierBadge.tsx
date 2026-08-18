import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface TierBadgeProps {
 tier: string;
 confidence: number;
 estimasiSisaJam: string;
}

const TIER_STYLES: Record<
 string,
 {
 bg: string;
 label: string;
 icon: typeof CheckCircle2;
 }
> = {
 Tier3_Prima: {
 bg: 'bg-[#16A34A]',
 label: 'PRIMA',
 icon: CheckCircle2,
 },
 Tier2_Sedang: {
 bg: 'bg-[#D97706]',
 label: 'SEDANG',
 icon: AlertTriangle,
 },
 Tier1_Kritis: {
 bg: 'bg-[#DC2626]',
 label: 'KRITIS',
 icon: XCircle,
 },
};

export default function TierBadge({ tier, confidence, estimasiSisaJam }: TierBadgeProps) {
 const style = TIER_STYLES[tier] ?? {
 bg: 'bg-[#0000FF]',
 label: tier,
 icon: CheckCircle2,
 };
 const Icon = style.icon;
 const pct = Math.round(confidence * 100);

 return (
 <div
 className={`w-full rounded-2xl ${style.bg} px-5 py-6 text-white`}
 >
 {/* Tier badge row */}
 <div className="flex items-center gap-2">
 <Icon className="h-6 w-6 shrink-0 text-white" aria-hidden="true" />
 <span className="font-outfit text-2xl font-black tracking-widest uppercase text-white">
 {style.label}
 </span>
 </div>

 {/* Big stats row */}
 <div className="mt-4 flex items-end justify-between gap-4">
 {/* Confidence — oversized numeral */}
 <div className="flex-1">
 <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-white/80">
 Keyakinan AI
 </p>
 <p className="font-outfit text-7xl font-black tabular-nums leading-none text-white">
 {pct}
 <span className="text-4xl font-bold text-white/80">%</span>
 </p>
 </div>

 {/* Divider */}
 <div className="h-16 w-px bg-white/30" aria-hidden="true" />

 {/* Remaining hours */}
 <div className="flex-1 text-right">
 <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-white/80">
 Sisa waktu
 </p>
 <p className="font-outfit text-2xl font-bold tabular-nums text-white">
 {estimasiSisaJam}
 </p>
 </div>
 </div>
 </div>
 );
}

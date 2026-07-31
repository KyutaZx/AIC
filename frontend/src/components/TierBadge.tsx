import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface TierBadgeProps {
  tier: string;
  confidence: number;
  estimasiSisaJam: string;
}

const TIER_STYLES: Record<string, { bg: string; label: string; icon: typeof CheckCircle2 }> = {
  Tier3_Prima: { bg: 'bg-green-600', label: 'PRIMA', icon: CheckCircle2 },
  Tier2_Sedang: { bg: 'bg-amber-600', label: 'SEDANG', icon: AlertTriangle },
  Tier1_Kritis: { bg: 'bg-red-600', label: 'KRITIS', icon: XCircle },
};

export default function TierBadge({ tier, confidence, estimasiSisaJam }: TierBadgeProps) {
  const style = TIER_STYLES[tier] ?? { bg: 'bg-slate-500', label: tier, icon: CheckCircle2 };
  const Icon = style.icon;

  return (
    <div className={`w-full rounded-2xl ${style.bg} px-6 py-8 text-center text-white shadow-lg`}>
      <div className="flex items-center justify-center gap-2">
        <Icon className="h-6 w-6" aria-hidden="true" />
        <p className="text-2xl font-black tracking-wide">{style.label}</p>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{Math.round(confidence * 100)}%</p>
      <p className="mt-1 text-sm font-medium text-white/90">Estimasi: {estimasiSisaJam}</p>
    </div>
  );
}

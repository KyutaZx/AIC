interface ConfidenceBarProps {
  confidence: number;
}

export default function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 80 ? 'bg-green-600' : pct >= 60 ? 'bg-amber-600' : 'bg-red-600';

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Tingkat keyakinan model</p>
        <p className="text-xs font-semibold text-slate-900 tabular-nums">{pct}%</p>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

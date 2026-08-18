interface ConfidenceBarProps {
 confidence: number;
}

export default function ConfidenceBar({ confidence }: ConfidenceBarProps) {
 const pct = Math.round(confidence * 100);
 const fillColor =
 pct >= 80 ? 'bg-green-600' : pct >= 60 ? 'bg-amber-500' : 'bg-red-600';

 return (
 <div>
 <div className="flex items-center justify-between">
 <p className="text-xs font-medium text-[#4B5563]">Tingkat keyakinan model</p>
 <p className="font-outfit text-xs font-bold tabular-nums text-[#0A0A1A]">{pct}%</p>
 </div>
 <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#E0E6FF]">
 <div
 className={`h-full rounded-full ${fillColor} transition-all duration-700 ease-out`}
 style={{ width:`${pct}%` }}
 />
 </div>
 </div>
 );
}

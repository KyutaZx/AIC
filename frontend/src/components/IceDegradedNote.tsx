import { Snowflake } from 'lucide-react';

export default function IceDegradedNote() {
 return (
 <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-3">
 <Snowflake className="mt-0.5 h-5 w-5 shrink-0 text-[#0000FF]" aria-hidden="true" />
 <p className="text-sm text-[#0A0A1A]">
 Tier disesuaikan karena ikan tidak disimpan dengan es.
 </p>
 </div>
 );
}

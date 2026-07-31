import { Snowflake } from 'lucide-react';

export default function IceDegradedNote() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-3 shadow-sm">
      <Snowflake className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
      <p className="text-sm text-slate-900">
        Tier disesuaikan karena ikan tidak disimpan dengan es.
      </p>
    </div>
  );
}

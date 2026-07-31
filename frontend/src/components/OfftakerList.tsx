import { MapPin, Phone } from 'lucide-react';
import type { Offtaker } from '@/lib/api';

interface OfftakerListProps {
  offtakers: Offtaker[];
  tier: string;
}

export default function OfftakerList({ offtakers, tier }: OfftakerListProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Offtaker</h2>
      {tier === 'Tier1_Kritis' && (
        <p className="mt-1 text-sm font-medium text-red-600">Segera proses atau jual lokal</p>
      )}
      {offtakers.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Tidak ada offtaker yang cocok untuk tier ini.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {offtakers.map((offtaker, index) => (
            <li
              key={`${offtaker.nama}-${index}`}
              className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-semibold text-slate-900">{offtaker.nama}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {offtaker.lokasi} &middot; {offtaker.jarak_km} km
              </p>
              <a
                href={`tel:${offtaker.kontak}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                {offtaker.kontak}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

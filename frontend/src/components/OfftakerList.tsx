import { MapPin, Phone } from 'lucide-react';
import type { Offtaker } from '@/lib/api';

interface OfftakerListProps {
  offtakers: Offtaker[];
  tier: string;
  jarakReal?: boolean;
}

export default function OfftakerList({ offtakers, tier, jarakReal }: OfftakerListProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[#0A0A1A]">Offtaker</h2>
      <p className="mt-1 text-xs text-[#9CA3AF]">
        {jarakReal ? 'Jarak estimasi dari lokasi kamu' : 'Jarak estimasi umum dari TPI'}
      </p>
      {tier === 'Tier1_Kritis' && (
        <p className="mt-1 text-sm font-semibold text-red-600">Segera proses atau jual lokal</p>
      )}
      {offtakers.length === 0 ? (
        <p className="mt-2 text-sm text-[#4B5563]">Tidak ada offtaker yang cocok untuk tier ini.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {offtakers.map((offtaker, index) => (
            <li key={`${offtaker.nama}-${index}`} className="card-freshco p-4">
              <p className="font-bold text-[#0A0A1A]">{offtaker.nama}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#4B5563]">
                <MapPin className="h-4 w-4 shrink-0 text-[#0000FF]" aria-hidden="true" />
                {offtaker.lokasi} &middot; {offtaker.jarak}
              </p>
              <a
                href={`tel:${offtaker.kontak}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0000FF] hover:text-[#0000CC]"
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

import { Landmark, MapPin, Globe } from "lucide-react";
import type { Place } from "@/lib/types";

export default function PlacesSection({ places }: { places: Place[] }) {
  if (!places.length) return <div className="text-center py-8 text-[var(--text-muted)]">No attractions found</div>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Landmark className="w-5 h-5 text-[var(--accent-violet)]" />Places to Visit ({places.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.map((p, i) => (
          <div key={i} className="glass p-4 glass-hover">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm">{p.name}</h4>
              {p.rating && <span className="text-xs badge-warning badge">{p.rating.toFixed(1)}</span>}
            </div>
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[var(--bg-glass)] text-[var(--accent-cyan)] mb-2">{p.category}</span>
            <p className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.address || "Address not available"}</p>
            {p.distance > 0 && <p className="text-xs text-[var(--text-secondary)]">{(p.distance / 1000).toFixed(1)} km from destination</p>}
            {p.website && (
              <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent-cyan)] hover:underline mt-2 flex items-center gap-1">
                <Globe className="w-3 h-3" />Visit website
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

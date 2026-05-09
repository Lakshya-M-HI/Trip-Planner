import { Car, Phone, Globe, Star, ExternalLink } from "lucide-react";
import type { TaxiService } from "@/lib/types";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  taxi: { label: "Taxi", color: "var(--warning)" },
  rental_car: { label: "Car Rental", color: "var(--accent-cyan)" },
  ride_hailing: { label: "Ride Hailing", color: "var(--accent-violet)" },
};

export default function TaxiSection({ services }: { services: TaxiService[] }) {
  if (!services.length) return <div className="text-center py-8 text-[var(--text-muted)]">No taxi/rental services found</div>;

  const grouped = {
    ride_hailing: services.filter((s) => s.type === "ride_hailing"),
    taxi: services.filter((s) => s.type === "taxi"),
    rental_car: services.filter((s) => s.type === "rental_car"),
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2"><Car className="w-5 h-5 text-[var(--accent-cyan)]" />Taxis & Car Rentals</h3>

      {Object.entries(grouped).map(([type, items]) => items.length > 0 && (
        <div key={type}>
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">{TYPE_LABELS[type]?.label || type}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((s, i) => (
              <div key={i} className="glass p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${TYPE_LABELS[s.type]?.color || "var(--accent-cyan)"}20` }}>
                  <Car className="w-5 h-5" style={{ color: TYPE_LABELS[s.type]?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{s.name}</span>
                    {s.rating > 0 && <span className="flex items-center gap-0.5 text-xs text-[var(--warning)]"><Star className="w-3 h-3 fill-current" />{s.rating}</span>}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-2 truncate">{s.address}</p>
                  <div className="flex items-center gap-3">
                    {s.phone && <a href={`tel:${s.phone}`} className="text-xs text-[var(--accent-cyan)] hover:underline flex items-center gap-1"><Phone className="w-3 h-3" />Call</a>}
                    {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent-cyan)] hover:underline flex items-center gap-1"><Globe className="w-3 h-3" />Website</a>}
                    {s.deepLink && <a href={s.deepLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent-violet)] hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />Open App</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

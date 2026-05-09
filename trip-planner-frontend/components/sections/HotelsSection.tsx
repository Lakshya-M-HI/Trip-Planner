import { Hotel as HotelIcon, Star, ExternalLink } from "lucide-react";
import type { Hotel } from "@/lib/types";

export default function HotelsSection({ hotels }: { hotels: Hotel[] }) {
  if (!hotels.length) return <div className="text-center py-8 text-[var(--text-muted)]">No hotels found</div>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><HotelIcon className="w-5 h-5 text-[var(--accent-cyan)]" />Available Hotels ({hotels.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hotels.map((h, i) => (
          <div key={i} className="glass p-4 glass-hover">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm leading-tight flex-1 mr-2">{h.name}</h4>
              {h.starRating && (
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: h.starRating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-[var(--warning)] text-[var(--warning)]" />)}
                </div>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-1">{h.address}</p>
            {h.roomType && <p className="text-xs text-[var(--text-secondary)] mb-2">Room: {h.roomType}</p>}
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xl font-bold gradient-text">{h.price.currency} {h.price.perNight.toLocaleString()}</span>
                <span className="text-xs text-[var(--text-muted)] ml-1">/night</span>
                <div className="text-xs text-[var(--text-secondary)]">Total: {h.price.currency} {h.price.total.toLocaleString()}</div>
              </div>
              {h.bookingUrl && (
                <a href={h.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn-gradient !py-1.5 !px-3 text-xs flex items-center gap-1">
                  Book <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

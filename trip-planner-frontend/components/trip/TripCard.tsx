import Link from "next/link";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { TripSummary } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  planning: "badge-info",
  ready: "badge-success",
  partial: "badge-warning",
  failed: "badge-error",
};

export default function TripCard({ trip }: { trip: TripSummary }) {
  return (
    <Link href={`/trip/${trip.tripId}`} className="glass glass-hover block p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Calendar className="w-4 h-4" />
          {format(new Date(trip.input.startDate), "MMM d")} — {format(new Date(trip.input.endDate), "MMM d, yyyy")}
        </div>
        <span className={`badge ${STATUS_STYLES[trip.status] || "badge-info"}`}>
          {trip.status}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
          <span className="text-sm font-medium truncate max-w-[120px]">{trip.input.startLocation.name}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[var(--accent-violet)] shrink-0" />
          <span className="text-sm font-medium truncate max-w-[120px]">{trip.input.destination.name}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold gradient-text">
          {trip.input.budget.currency} {trip.input.budget.amount.toLocaleString()}
        </span>
        <span className="text-xs text-[var(--accent-cyan)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          View Details <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

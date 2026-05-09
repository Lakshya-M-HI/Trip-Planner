import { Car, Plane, Train, Clock, MapPin, ExternalLink, Fuel } from "lucide-react";
import type { DrivingRoute, Flight, TrainRoute } from "@/lib/types";

export default function TransportSection({ driving, flights, trains }: { driving: DrivingRoute | null; flights: Flight[]; trains: TrainRoute[] }) {
  return (
    <div className="space-y-6">
      {/* Driving */}
      {driving && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Car className="w-5 h-5 text-[var(--accent-cyan)]" />By Car</h3>
          <div className="glass p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Distance" value={driving.distance.text} />
            <Stat label="Duration" value={driving.duration.text} />
            <Stat label="Fuel Est." value={`${driving.fuelEstimate.liters}L (~₹${driving.fuelEstimate.costEstimate.amount})`} />
            <Stat label="Tolls Est." value={`₹${driving.tolls.estimated}`} />
          </div>
        </div>
      )}

      {/* Flights */}
      {flights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Plane className="w-5 h-5 text-[var(--accent-violet)]" />Flights ({flights.length})</h3>
          <div className="space-y-3">
            {flights.map((f, i) => (
              <div key={i} className="glass p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <span className="text-sm font-bold text-[var(--accent-cyan)]">{f.airline}</span>
                  <span className="text-xs text-[var(--text-muted)]">{f.flightNumber}</span>
                </div>
                <div className="flex items-center gap-2 flex-1 text-sm">
                  <span>{f.departure.iataCode}</span>
                  <div className="flex-1 h-px bg-[var(--border)] relative"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] bg-[var(--bg-primary)] px-2">{f.duration}</div></div>
                  <span>{f.arrival.iataCode}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{f.stops === 0 ? "Direct" : `${f.stops} stop${f.stops > 1 ? "s" : ""}`}</span>
                  <span className="font-bold text-[var(--success)]">{f.price.currency} {f.price.amount.toLocaleString()}</span>
                  {f.bookingUrl && <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline"><ExternalLink className="w-4 h-4" /></a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trains/Buses */}
      {trains.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Train className="w-5 h-5 text-[var(--warning)]" />Trains & Buses ({trains.length})</h3>
          <div className="space-y-3">
            {trains.map((t, i) => (
              <div key={i} className="glass p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm">{t.name}</span>
                    <span className="text-xs text-[var(--text-muted)] ml-2">{t.vehicle}</span>
                  </div>
                  <span className="font-bold text-sm text-[var(--success)]">
                    {t.price.currency} {t.price.low}{t.price.high > t.price.low ? `–${t.price.high}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.duration}</span>
                  {t.operator && <span>{t.operator}</span>}
                  {t.bookingUrl && <a href={t.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline flex items-center gap-1">Book <ExternalLink className="w-3 h-3" /></a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!driving && flights.length === 0 && trains.length === 0 && (
        <div className="text-center py-8 text-[var(--text-muted)]">No transport data available</div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[var(--text-muted)] mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

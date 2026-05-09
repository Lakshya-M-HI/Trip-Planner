import { Cloud, Thermometer, Droplets, Wind, Shirt } from "lucide-react";
import type { WeatherDay } from "@/lib/types";
import { format } from "date-fns";

export default function WeatherSection({ weather }: { weather: { forecast: WeatherDay[]; summary: string; packingTips: string[] } | null }) {
  if (!weather?.forecast?.length) return <div className="text-center py-8 text-[var(--text-muted)]">Weather data not available</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2"><Cloud className="w-5 h-5 text-[var(--info)]" />Weather Forecast</h3>
      {weather.summary && <p className="text-sm text-[var(--text-secondary)] glass p-3">{weather.summary}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {weather.forecast.slice(0, 5).map((day, i) => (
          <div key={i} className="glass p-3 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">{format(new Date(day.date), "EEE, MMM d")}</div>
            <div className="text-2xl mb-1">{getWeatherEmoji(day.description)}</div>
            <div className="text-sm font-semibold">{day.tempMax}° / {day.tempMin}°</div>
            <div className="text-xs text-[var(--text-muted)] capitalize mt-1">{day.description}</div>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-0.5"><Droplets className="w-3 h-3" />{day.rainChance}%</span>
              <span className="flex items-center gap-0.5"><Wind className="w-3 h-3" />{day.windSpeed}m/s</span>
            </div>
          </div>
        ))}
      </div>

      {weather.packingTips?.length > 0 && (
        <div className="glass p-4">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2"><Shirt className="w-4 h-4 text-[var(--accent-violet)]" />Packing Tips</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {weather.packingTips.map((tip, i) => <li key={i} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">• {tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function getWeatherEmoji(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes("clear") || d.includes("sunny")) return "☀️";
  if (d.includes("cloud")) return "☁️";
  if (d.includes("rain") || d.includes("drizzle")) return "🌧️";
  if (d.includes("thunder") || d.includes("storm")) return "⛈️";
  if (d.includes("snow")) return "❄️";
  if (d.includes("fog") || d.includes("mist")) return "🌫️";
  return "🌤️";
}

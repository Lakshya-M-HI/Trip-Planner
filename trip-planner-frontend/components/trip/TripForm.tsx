"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Wallet, Users, Sparkles, Navigation, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createTrip } from "@/store/slices/tripSlice";
import api from "@/lib/api";
import type { AutocompleteSuggestion, Location } from "@/lib/types";
import toast from "react-hot-toast";

const CURRENCIES = ["INR","USD","EUR","GBP","AUD","CAD","JPY","SGD","AED"];

export default function TripForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { isPlanningLoading } = useAppSelector((s) => s.trip);

  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [startQuery, setStartQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [travelers, setTravelers] = useState(1);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Autocomplete debounce
  const fetchSuggestions = useCallback(async (query: string, setter: (s: AutocompleteSuggestion[]) => void) => {
    if (query.length < 2) { setter([]); return; }
    try {
      const { data } = await api.get("/location/autocomplete", { params: { q: query } });
      setter(data.data || []);
    } catch { setter([]); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(startQuery, setStartSuggestions), 300);
    return () => clearTimeout(timer);
  }, [startQuery, fetchSuggestions]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(destQuery, setDestSuggestions), 300);
    return () => clearTimeout(timer);
  }, [destQuery, fetchSuggestions]);

  const selectSuggestion = async (suggestion: AutocompleteSuggestion, type: "start" | "dest") => {
    try {
      const { data } = await api.get(`/location/place/${suggestion.placeId}`);
      const loc: Location = { name: suggestion.description, lat: data.data.lat, lng: data.data.lng, formattedAddress: data.data.formattedAddress, placeId: suggestion.placeId };
      if (type === "start") { setStartLocation(loc); setStartQuery(suggestion.description); setStartSuggestions([]); }
      else { setDestination(loc); setDestQuery(suggestion.description); setDestSuggestions([]); }
    } catch { toast.error("Failed to get location details"); }
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data } = await api.get("/location/geocode/reverse", { params: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
          const loc: Location = { name: data.data.formattedAddress, lat: pos.coords.latitude, lng: pos.coords.longitude, formattedAddress: data.data.formattedAddress };
          setStartLocation(loc);
          setStartQuery(data.data.formattedAddress);
        } catch { toast.error("Could not determine your location"); }
        setDetectingLocation(false);
      },
      () => { toast.error("Location access denied"); setDetectingLocation(false); }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push("/login?redirect=/"); return; }
    if (!startLocation || !destination) { toast.error("Please select both locations"); return; }
    if (!startDate || !endDate) { toast.error("Please select travel dates"); return; }
    if (!budget || parseFloat(budget) <= 0) { toast.error("Please enter a valid budget"); return; }

    const result = await dispatch(createTrip({
      startLocation, destination, startDate, endDate,
      budget: { amount: parseFloat(budget), currency },
      travelers,
    }));
    if (createTrip.fulfilled.match(result)) {
      toast.success("Trip planning started!");
      router.push(`/trip/${result.payload.tripId}`);
    } else {
      toast.error((result.payload as string) || "Failed to create trip");
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="glass p-6 sm:p-8 space-y-6 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold gradient-text">Plan Your Trip</h2>

      {/* Start Location */}
      <div className="relative">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Start Location</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-cyan)]" />
            <input value={startQuery} onChange={(e) => { setStartQuery(e.target.value); setStartLocation(null); }} className="input-dark pl-10" placeholder="Where are you starting from?" />
            {startSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 glass border border-[var(--border)] rounded-lg overflow-hidden z-50 max-h-48 overflow-y-auto">
                {startSuggestions.map((s) => (
                  <button key={s.placeId} type="button" onClick={() => selectSuggestion(s, "start")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-glass)] transition-colors">
                    <span className="text-[var(--text-primary)]">{s.mainText}</span>
                    <span className="text-[var(--text-muted)] ml-1 text-xs">{s.secondaryText}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={detectCurrentLocation} disabled={detectingLocation} className="px-3 py-2 glass hover:bg-[var(--bg-glass)] rounded-lg text-[var(--accent-cyan)] transition-colors shrink-0" title="Detect my location">
            {detectingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Destination */}
      <div className="relative">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Destination</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-violet)]" />
          <input value={destQuery} onChange={(e) => { setDestQuery(e.target.value); setDestination(null); }} className="input-dark pl-10" placeholder="Where do you want to go?" />
          {destSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 glass border border-[var(--border)] rounded-lg overflow-hidden z-50 max-h-48 overflow-y-auto">
              {destSuggestions.map((s) => (
                <button key={s.placeId} type="button" onClick={() => selectSuggestion(s, "dest")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-glass)] transition-colors">
                  <span className="text-[var(--text-primary)]">{s.mainText}</span>
                  <span className="text-[var(--text-muted)] ml-1 text-xs">{s.secondaryText}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={minDate} className="input-dark pl-10" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || minDate} className="input-dark pl-10" />
          </div>
        </div>
      </div>

      {/* Budget & Travelers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Budget</label>
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="input-dark pl-10" placeholder="Amount" min="0" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-dark">{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Travelers</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="number" value={travelers} onChange={(e) => setTravelers(parseInt(e.target.value) || 1)} min={1} max={20} className="input-dark pl-10" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={isPlanningLoading} className="btn-gradient w-full flex items-center justify-center gap-2 !py-3.5 text-base">
        {isPlanningLoading ? (
          <><Loader2 className="w-5 h-5 animate-spin" />Planning your trip...</>
        ) : (
          <><Sparkles className="w-5 h-5" />Plan My Trip with AI</>
        )}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MapPin, ArrowRight, Calendar, Users, Wallet, Sparkles } from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api";
import type { Trip } from "@/lib/types";
import TransportSection from "@/components/sections/TransportSection";
import HotelsSection from "@/components/sections/HotelsSection";
import PlacesSection from "@/components/sections/PlacesSection";
import WeatherSection from "@/components/sections/WeatherSection";
import ItinerarySection from "@/components/sections/ItinerarySection";
import Link from "next/link";

export default function SharedTripPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tripId = params.tripId as string;
  const token = searchParams.get("token") || "";
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("itinerary");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/trips/shared/${tripId}`, { params: { token } });
        setTrip(data.data.trip);
      } catch { setError("Trip not found or invalid share link"); }
      setLoading(false);
    })();
  }, [tripId, token]);

  const TABS = [
    { id: "itinerary", label: "🤖 AI Plan" },
    { id: "transport", label: "🚗 Transport" },
    { id: "hotels", label: "🏨 Hotels" },
    { id: "places", label: "🏛️ Attractions" },
    { id: "weather", label: "🌤️ Weather" },
  ];

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">{Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-32"/>)}</div>;
  if (error) return <div className="text-center py-20 text-[var(--text-secondary)]">{error}</div>;
  if (!trip) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-4"><span className="text-xs badge-info badge">Shared Trip</span></div>

      {/* Hero */}
      <div className="glass p-6 mb-6">
        <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-1.5"><MapPin className="w-5 h-5 text-[var(--accent-cyan)]" /><span className="font-semibold">{trip.input.startLocation.name}</span></div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
          <div className="flex items-center gap-1.5"><MapPin className="w-5 h-5 text-[var(--accent-violet)]" /><span className="font-semibold">{trip.input.destination.name}</span></div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--text-secondary)]">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(trip.input.startDate), "MMM d")} — {format(new Date(trip.input.endDate), "MMM d, yyyy")}</span>
          <span className="flex items-center gap-1"><Wallet className="w-4 h-4" />{trip.input.budget.currency} {trip.input.budget.amount.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{trip.input.travelers}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list mb-6">
        {TABS.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-trigger ${activeTab === tab.id ? "active" : ""}`}>{tab.label}</button>))}
      </div>

      {/* Content */}
      <Suspense fallback={<div className="skeleton h-48" />}>
        {activeTab === "itinerary" && <ItinerarySection itinerary={trip.aiItinerary} />}
        {activeTab === "transport" && <TransportSection driving={trip.transport?.driving || null} flights={trip.transport?.flights || []} trains={trip.transport?.trains || []} />}
        {activeTab === "hotels" && <HotelsSection hotels={trip.hotels || []} />}
        {activeTab === "places" && <PlacesSection places={trip.places || []} />}
        {activeTab === "weather" && <WeatherSection weather={trip.weather} />}
      </Suspense>

      {/* CTA */}
      <div className="text-center mt-12 py-8 border-t border-[var(--border)]">
        <p className="text-sm text-[var(--text-secondary)] mb-4">Want to plan your own trip?</p>
        <Link href="/" className="btn-gradient inline-flex items-center gap-2"><Sparkles className="w-4 h-4" />Plan My Trip</Link>
      </div>
    </div>
  );
}

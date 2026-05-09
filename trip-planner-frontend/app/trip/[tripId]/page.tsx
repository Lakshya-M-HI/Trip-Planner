"use client";

import { useEffect, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, ArrowRight, Calendar, Users, Wallet, Share2, Download, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTripById, fetchTripStatus, deleteTrip, shareTrip } from "@/store/slices/tripSlice";
import { setActiveTripTab } from "@/store/slices/uiSlice";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TripPlanningLoader from "@/components/trip/TripPlanningLoader";
import TransportSection from "@/components/sections/TransportSection";
import HotelsSection from "@/components/sections/HotelsSection";
import PlacesSection from "@/components/sections/PlacesSection";
import TaxiSection from "@/components/sections/TaxiSection";
import WeatherSection from "@/components/sections/WeatherSection";
import ItinerarySection from "@/components/sections/ItinerarySection";
import api from "@/lib/api";
import toast from "react-hot-toast";

const TABS = [
  { id: "transport", label: "🚗 Transport" },
  { id: "hotels", label: "🏨 Hotels" },
  { id: "places", label: "🏛️ Attractions" },
  { id: "taxis", label: "🚕 Taxis" },
  { id: "weather", label: "🌤️ Weather" },
  { id: "itinerary", label: "🤖 AI Plan" },
];

const STATUS_STYLES: Record<string, string> = {
  planning: "badge-info",
  ready: "badge-success",
  partial: "badge-warning",
  failed: "badge-error",
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tripId = params.tripId as string;
  const { currentTrip, isLoading, error } = useAppSelector((s) => s.trip);
  const activeTab = useAppSelector((s) => s.ui.activeTripTab);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch trip data
  useEffect(() => {
    if (tripId) dispatch(fetchTripById(tripId));
  }, [dispatch, tripId]);

  // Poll for status if planning
  useEffect(() => {
    if (currentTrip?.status === "planning") {
      pollRef.current = setInterval(() => {
        dispatch(fetchTripStatus(tripId)).then((res) => {
          if (fetchTripStatus.fulfilled.match(res) && res.payload.status !== "planning") {
            dispatch(fetchTripById(tripId));
            if (pollRef.current) clearInterval(pollRef.current);
          }
        });
      }, 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [currentTrip?.status, dispatch, tripId]);

  const handleShare = async () => {
    const result = await dispatch(shareTrip(tripId));
    if (shareTrip.fulfilled.match(result)) {
      const url = `${window.location.origin}/shared/${tripId}?token=${result.payload.shareToken}`;
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard!");
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get(`/trips/${tripId}/export/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a"); a.href = url; a.download = `trip-${tripId}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch { toast.error("Failed to export PDF"); }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    const result = await dispatch(deleteTrip(tripId));
    if (deleteTrip.fulfilled.match(result)) { toast.success("Trip deleted"); router.push("/dashboard"); }
  };

  const trip = currentTrip;

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !trip ? (
          <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-10 h-10 text-[var(--error)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)]">{error}</p>
          </div>
        ) : trip ? (
          <>
            {/* Hero Header */}
            <div className="glass p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[var(--accent-cyan)]" />
                    <span className="font-semibold">{trip.input.startLocation.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[var(--accent-violet)]" />
                    <span className="font-semibold">{trip.input.destination.name}</span>
                  </div>
                </div>
                <span className={`badge ${STATUS_STYLES[trip.status] || "badge-info"}`}>{trip.status}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(trip.input.startDate), "MMM d")} — {format(new Date(trip.input.endDate), "MMM d, yyyy")}</span>
                <span className="flex items-center gap-1"><Wallet className="w-4 h-4" />{trip.input.budget.currency} {trip.input.budget.amount.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{trip.input.travelers} traveler{trip.input.travelers > 1 ? "s" : ""}</span>
              </div>

              {/* Actions */}
              {trip.status !== "planning" && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                  <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 glass text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors rounded-lg cursor-pointer"><Share2 className="w-4 h-4" />Share</button>
                  <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 glass text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors rounded-lg cursor-pointer"><Download className="w-4 h-4" />Export PDF</button>
                  <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 glass text-sm text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors rounded-lg cursor-pointer ml-auto"><Trash2 className="w-4 h-4" />Delete</button>
                </div>
              )}
            </div>

            {/* Partial failure warning */}
            {trip.status === "partial" && trip.apiErrors?.length > 0 && (
              <div className="glass p-4 mb-6 border-l-2 border-[var(--warning)]">
                <p className="text-sm text-[var(--warning)] font-medium mb-1">Some services were unavailable</p>
                <p className="text-xs text-[var(--text-muted)]">{trip.apiErrors.map((e) => e.service).join(", ")} failed to respond. Results may be incomplete.</p>
              </div>
            )}

            {/* Planning State */}
            {trip.status === "planning" ? (
              <TripPlanningLoader message={trip.statusMessage} />
            ) : (
              <>
                {/* Tabs */}
                <div className="tab-list mb-6">
                  {TABS.map((tab) => (
                    <button key={tab.id} onClick={() => dispatch(setActiveTripTab(tab.id))} className={`tab-trigger ${activeTab === tab.id ? "active" : ""}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <Suspense fallback={<div className="skeleton h-48" />}>
                  {activeTab === "transport" && <TransportSection driving={trip.transport?.driving || null} flights={trip.transport?.flights || []} trains={trip.transport?.trains || []} />}
                  {activeTab === "hotels" && <HotelsSection hotels={trip.hotels || []} />}
                  {activeTab === "places" && <PlacesSection places={trip.places || []} />}
                  {activeTab === "taxis" && <TaxiSection services={trip.taxiServices || []} />}
                  {activeTab === "weather" && <WeatherSection weather={trip.weather} />}
                  {activeTab === "itinerary" && <ItinerarySection itinerary={trip.aiItinerary} />}
                </Suspense>
              </>
            )}
          </>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}

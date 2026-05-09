"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus, Filter, MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTrips } from "@/store/slices/tripSlice";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TripCard from "@/components/trip/TripCard";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { trips, totalTrips, isLoading } = useAppSelector((s) => s.trip);

  useEffect(() => {
    dispatch(fetchTrips({ page: 1, limit: 12 }));
  }, [dispatch]);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Trips</h1>
            <p className="text-sm text-[var(--text-secondary)]">{totalTrips} trip{totalTrips !== 1 ? "s" : ""} planned</p>
          </div>
          <Link href="/" className="btn-gradient flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />New Trip
          </Link>
        </div>

        {/* Trip Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-40" />
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.tripId} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Plan your first trip and let AI handle the rest!</p>
            <Link href="/" className="btn-gradient inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />Plan My First Trip
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

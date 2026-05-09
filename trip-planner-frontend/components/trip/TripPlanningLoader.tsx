"use client";

import { Loader2, Plane, MapPin, Brain } from "lucide-react";

const STEPS = [
  { icon: MapPin, label: "Finding routes & transport..." },
  { icon: Plane, label: "Searching flights & hotels..." },
  { icon: Brain, label: "AI is creating your itinerary..." },
];

export default function TripPlanningLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-[var(--border)] border-t-[var(--accent-cyan)] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Plane className="w-8 h-8 text-[var(--accent-cyan)]" />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2 gradient-text">Planning Your Trip</h3>
      <p className="text-[var(--text-secondary)] text-sm mb-8">{message || "This may take a minute..."}</p>
      <div className="space-y-3 w-full max-w-sm">
        {STEPS.map((step, i) => (
          <div key={i} className="glass p-3 flex items-center gap-3 animate-pulse-glow" style={{ animationDelay: `${i * 0.5}s` }}>
            <step.icon className="w-5 h-5 text-[var(--accent-cyan)] shrink-0" />
            <span className="text-sm text-[var(--text-secondary)]">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

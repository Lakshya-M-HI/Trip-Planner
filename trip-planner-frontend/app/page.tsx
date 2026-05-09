import { Plane, Hotel, MapPin, Brain, Shield, Zap } from "lucide-react";
import TripForm from "@/components/trip/TripForm";

const FEATURES = [
  { icon: Plane, title: "Flights & Trains", desc: "Real-time search across airlines and rail operators worldwide" },
  { icon: Hotel, title: "Hotels", desc: "Compare prices and availability at your destination" },
  { icon: MapPin, title: "Attractions", desc: "Discover famous places, landmarks, and hidden gems" },
  { icon: Brain, title: "AI Itinerary", desc: "Get a budget-optimized day-by-day plan from Gemini AI" },
  { icon: Shield, title: "Secure", desc: "Enterprise-grade auth with encrypted tokens" },
  { icon: Zap, title: "Instant", desc: "All APIs queried in parallel for speed" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Plan Your Perfect Trip{" "}
              <span className="gradient-text">with AI</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Enter your destination and budget. Our AI searches flights, trains, hotels,
              and attractions — then creates a personalized itinerary in seconds.
            </p>
          </div>

          {/* Trip Form */}
          <TripForm />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">
          Everything You Need, <span className="gradient-text">One Search</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="glass p-6 glass-hover group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-[var(--accent-cyan)]" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">
          How It <span className="gradient-text">Works</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-8">
          {[
            { step: "1", title: "Enter Details", desc: "Your start point, destination, dates, and budget" },
            { step: "2", title: "AI Searches", desc: "7 APIs queried in parallel for best results" },
            { step: "3", title: "Get Your Plan", desc: "AI-optimized itinerary with 3 budget tiers" },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                {s.step}
              </div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[var(--text-muted)]">
          © {new Date().getFullYear()} TripPlannerAI — Built with AI, for travelers.
        </div>
      </footer>
    </div>
  );
}

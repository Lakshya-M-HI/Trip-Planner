"use client";

import { Brain, Clock, MapPin, Utensils, Lightbulb, UtensilsCrossed } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveBudgetTier } from "@/store/slices/uiSlice";
import type { AIItinerary, BudgetTier, DayPlan } from "@/lib/types";

export default function ItinerarySection({ itinerary }: { itinerary: AIItinerary | null }) {
  const dispatch = useAppDispatch();
  const activeTier = useAppSelector((s) => s.ui.activeBudgetTier);

  if (!itinerary?.summary) return <div className="text-center py-8 text-[var(--text-muted)]">AI itinerary not available</div>;

  const tiers = itinerary.budgetTiers;
  const currentTier: BudgetTier | undefined = tiers?.[activeTier];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2"><Brain className="w-5 h-5 text-[var(--accent-violet)]" />AI Itinerary</h3>
      <p className="text-sm text-[var(--text-secondary)] glass p-3">{itinerary.summary}</p>

      {itinerary.bestTransportOption && (
        <div className="glass p-3 border-l-2 border-[var(--accent-cyan)]">
          <span className="text-xs text-[var(--accent-cyan)] font-semibold uppercase">Best Transport:</span>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{itinerary.bestTransportOption}</p>
        </div>
      )}

      {/* Budget Tier Tabs */}
      <div className="tab-list">
        {(["budget", "moderate", "premium"] as const).map((tier) => (
          <button key={tier} onClick={() => dispatch(setActiveBudgetTier(tier))} className={`tab-trigger capitalize ${activeTier === tier ? "active" : ""}`}>
            {tier} {currentTier && tiers[tier]?.totalCost ? `(${tiers[tier].budgetBreakdown?.currency || "₹"}${tiers[tier].totalCost.toLocaleString()})` : ""}
          </button>
        ))}
      </div>

      {/* Day-wise Plan */}
      {currentTier?.dayWisePlan?.length ? (
        <div className="space-y-4">
          {currentTier.dayWisePlan.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-[var(--text-muted)] text-center py-4">No day plan available for this tier</div>
      )}

      {/* Budget Breakdown */}
      {currentTier?.budgetBreakdown && (
        <div className="glass p-4">
          <h4 className="text-sm font-medium mb-3">Budget Breakdown</h4>
          <div className="space-y-2">
            {["transport", "accommodation", "food", "activities", "miscellaneous"].map((key) => {
              const item = currentTier.budgetBreakdown[key as keyof typeof currentTier.budgetBreakdown] as { amount: number; percentage: number } | undefined;
              if (!item || typeof item !== "object") return null;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-secondary)] w-28 capitalize">{key}</span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all" style={{ width: `${Math.min(item.percentage, 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium w-20 text-right">{item.percentage}% ({item.amount})</span>
                </div>
              );
            })}
            <div className="pt-2 mt-2 border-t border-[var(--border)] flex justify-between">
              <span className="text-sm font-bold">Total</span>
              <span className={`text-sm font-bold ${currentTier.budgetBreakdown.withinBudget ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                {currentTier.budgetBreakdown.currency} {currentTier.budgetBreakdown.total?.toLocaleString()}
                {currentTier.budgetBreakdown.withinBudget ? " ✓ Within Budget" : " ✗ Over Budget"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tips & Food */}
      {itinerary.tips?.length > 0 && (
        <div className="glass p-4">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2"><Lightbulb className="w-4 h-4 text-[var(--warning)]" />Travel Tips</h4>
          <ul className="space-y-1">{itinerary.tips.map((tip, i) => <li key={i} className="text-xs text-[var(--text-secondary)]">• {tip}</li>)}</ul>
        </div>
      )}

      {itinerary.localFood?.length > 0 && (
        <div className="glass p-4">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2"><UtensilsCrossed className="w-4 h-4 text-[var(--accent-cyan)]" />Local Food</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {itinerary.localFood.map((f, i) => (
              <div key={i} className="text-xs"><span className="font-medium text-[var(--text-primary)]">{f.name}</span> <span className="text-[var(--text-muted)]">— {f.description}</span> <span className="text-[var(--success)]">{f.priceRange}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DayCard({ day }: { day: DayPlan }) {
  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">Day {day.day}{day.title ? `: ${day.title}` : ""}</h4>
        {day.dailyCost > 0 && <span className="text-xs badge-info badge">~{day.dailyCost.toLocaleString()}</span>}
      </div>
      <div className="space-y-2">
        {day.activities?.map((act, i) => (
          <div key={i} className="flex gap-3 text-xs">
            <span className="text-[var(--accent-cyan)] font-mono w-14 shrink-0">{act.time}</span>
            <div>
              <span className="text-[var(--text-primary)]">{act.activity}</span>
              {act.location && <span className="text-[var(--text-muted)] ml-1">@ {act.location}</span>}
              {act.estimatedCost > 0 && <span className="text-[var(--success)] ml-1">(~{act.estimatedCost})</span>}
            </div>
          </div>
        ))}
      </div>
      {day.meals?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex flex-wrap gap-3">
            {day.meals.map((m, i) => (
              <span key={i} className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                <Utensils className="w-3 h-3" /><span className="capitalize">{m.type}:</span> {m.suggestion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

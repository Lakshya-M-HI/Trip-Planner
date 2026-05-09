"use client";
import { AlertTriangle, RotateCcw } from "lucide-react";
export default function SharedTripError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><AlertTriangle className="w-10 h-10 text-[var(--error)] mx-auto mb-3" /><p className="text-sm text-[var(--text-secondary)] mb-4">{error.message}</p><button onClick={reset} className="btn-gradient flex items-center gap-2 mx-auto"><RotateCcw className="w-4 h-4" />Retry</button></div>
    </div>
  );
}

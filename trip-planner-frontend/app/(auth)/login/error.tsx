"use client";
import { AlertTriangle, RotateCcw } from "lucide-react";
export default function LoginError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="text-center py-8">
      <AlertTriangle className="w-8 h-8 text-[var(--error)] mx-auto mb-3" />
      <p className="text-sm text-[var(--text-secondary)] mb-4">{error.message || "Something went wrong"}</p>
      <button onClick={reset} className="btn-gradient text-sm flex items-center gap-1 mx-auto"><RotateCcw className="w-3 h-3" />Retry</button>
    </div>
  );
}

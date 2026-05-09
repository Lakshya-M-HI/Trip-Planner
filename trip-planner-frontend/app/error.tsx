"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[var(--error)]15 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-[var(--error)]" />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <button onClick={reset} className="btn-gradient flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" />Try Again
        </button>
      </div>
    </div>
  );
}

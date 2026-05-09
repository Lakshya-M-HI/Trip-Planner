"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0f1a", color: "#f1f5f9", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💥</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Something went wrong</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={reset}
            style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "white", border: "none", padding: "0.75rem 1.5rem", borderRadius: "0.75rem", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}

import Link from "next/link";
import { MapPin, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold gradient-text mb-4">404</div>
        <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Looks like you&apos;ve wandered off the map! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-gradient inline-flex items-center gap-2">
          <Compass className="w-4 h-4" />Back to Home
        </Link>
      </div>
    </div>
  );
}

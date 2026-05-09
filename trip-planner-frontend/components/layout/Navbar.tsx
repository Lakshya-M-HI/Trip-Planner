"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, LogOut, User, Menu, X, Compass } from "lucide-react";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]" style={{ borderRadius: 0 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">TripPlannerAI</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink href="/" active={pathname === "/"}>Home</NavLink>
                <NavLink href="/dashboard" active={pathname === "/dashboard"}>My Trips</NavLink>
                <div className="ml-4 pl-4 border-l border-[var(--border)] flex items-center gap-3">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink href="/" active={pathname === "/"}>Home</NavLink>
                <Link href="/login" className="btn-gradient ml-3 text-sm !py-2 !px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-[var(--border)] px-4 py-4 space-y-2" style={{ borderRadius: 0 }}>
          <MobileLink href="/" onClick={() => setMenuOpen(false)}>Home</MobileLink>
          {isAuthenticated ? (
            <>
              <MobileLink href="/dashboard" onClick={() => setMenuOpen(false)}>My Trips</MobileLink>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--bg-glass)] rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <MobileLink href="/login" onClick={() => setMenuOpen(false)}>Get Started</MobileLink>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "text-[var(--accent-cyan)] bg-[var(--bg-glass)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)]"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)] rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}

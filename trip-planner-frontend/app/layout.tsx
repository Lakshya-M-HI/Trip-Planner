import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/store/StoreProvider";
import Navbar from "@/components/layout/Navbar";
import AuthInitializer from "@/components/auth/AuthInitializer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TripPlannerAI — Plan Your Perfect Trip with AI",
  description: "AI-powered trip planner that finds the best flights, trains, hotels, and attractions — then generates a budget-optimized itinerary.",
  keywords: ["trip planner", "AI travel", "budget travel", "flight search", "hotel booking"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <AuthInitializer />
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
              },
              success: { iconTheme: { primary: "var(--success)", secondary: "white" } },
              error: { iconTheme: { primary: "var(--error)", secondary: "white" } },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}

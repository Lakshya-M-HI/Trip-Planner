import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Login — TripPlannerAI" };

export default function LoginPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
      <LoginForm />
    </>
  );
}

import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Register — TripPlannerAI" };

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      <RegisterForm />
    </>
  );
}

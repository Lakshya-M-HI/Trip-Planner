"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const CURRENCIES = ["INR","USD","EUR","GBP","AUD","CAD","JPY","SGD","AED","THB"];

export default function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading } = useAppSelector((s) => s.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { preferredCurrency: "INR" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created!");
      router.push("/dashboard");
    } else {
      toast.error((result.payload as string) || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input {...register("name")} className={`input-dark pl-10 ${errors.name ? "input-error" : ""}`} placeholder="Your name" />
        </div>
        {errors.name && <p className="text-xs text-[var(--error)] mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input type="email" {...register("email")} className={`input-dark pl-10 ${errors.email ? "input-error" : ""}`} placeholder="you@example.com" />
        </div>
        {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="password" {...register("password")} className={`input-dark pl-10 ${errors.password ? "input-error" : ""}`} placeholder="••••••••" />
          </div>
          {errors.password && <p className="text-xs text-[var(--error)] mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Confirm</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="password" {...register("confirmPassword")} className={`input-dark pl-10 ${errors.confirmPassword ? "input-error" : ""}`} placeholder="••••••••" />
          </div>
          {errors.confirmPassword && <p className="text-xs text-[var(--error)] mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Preferred Currency</label>
        <select {...register("preferredCurrency")} className="input-dark">
          {CURRENCIES.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>

      <button type="submit" disabled={isLoading} className="btn-gradient w-full flex items-center justify-center gap-2">
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <><UserPlus className="w-4 h-4" />Create Account</>
        )}
      </button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent-cyan)] hover:underline font-medium">Sign in</Link>
      </p>
    </form>
  );
}

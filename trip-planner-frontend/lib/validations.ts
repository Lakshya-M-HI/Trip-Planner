import { z } from "zod";

/* ═══════════════════════════════
   Zod Validation Schemas
   ═══════════════════════════════ */

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
        "Must include uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string(),
    preferredCurrency: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const tripFormSchema = z
  .object({
    startLocation: z.object({
      name: z.string().min(1, "Start location is required"),
      lat: z.number(),
      lng: z.number(),
      formattedAddress: z.string().optional(),
      placeId: z.string().optional(),
    }),
    destination: z.object({
      name: z.string().min(1, "Destination is required"),
      lat: z.number(),
      lng: z.number(),
      formattedAddress: z.string().optional(),
      placeId: z.string().optional(),
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    budget: z.object({
      amount: z.number().positive("Budget must be positive"),
      currency: z.string().default("INR"),
    }),
    travelers: z.number().int().min(1).max(20).default(1),
    preferences: z
      .object({
        travelStyle: z.enum(["budget", "moderate", "luxury"]).default("moderate"),
        interests: z.array(z.string()).default([]),
      })
      .optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TripFormData = z.infer<typeof tripFormSchema>;

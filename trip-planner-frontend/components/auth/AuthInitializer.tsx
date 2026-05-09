"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { refreshSession } from "@/store/slices/authSlice";

/** Runs once on mount to restore session from httpOnly refresh cookie */
export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refreshSession());
  }, [dispatch]);

  return null; // Renders nothing — just triggers the refresh
}

/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { DoctorDto, UpdateDoctorProfileRequest } from "@/lib/types";

/**
 * The backend has no GET /doctors/me endpoint. A doctor's own profile is
 * found by listing all doctors (public endpoint) and matching userId from
 * the JWT. Saving goes through PUT /doctors/profile, which creates the
 * profile on first save (onboarding) and updates it afterwards.
 */
export function useDoctorProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<DoctorDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.userId ?? null;

  const fetchProfile = useCallback(
    async (signal?: AbortSignal) => {
      if (userId == null) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const doctors = await apiFetch<DoctorDto[]>("/doctors", { signal });
        if (!signal?.aborted) {
          // No match = no profile yet (onboarding flow)
          setProfile(doctors.find((d) => d.userId === userId) ?? null);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!signal?.aborted) {
          setError(err instanceof ApiError ? err.message : "Couldn't load your profile.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    fetchProfile(controller.signal);
    return () => controller.abort();
  }, [fetchProfile, authLoading]);

  const saveProfile = async (payload: UpdateDoctorProfileRequest): Promise<DoctorDto> => {
    const updated = await apiFetch<DoctorDto>("/doctors/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setProfile(updated);
    return updated;
  };

  return {
    profile,
    loading: loading || authLoading,
    error,
    refetch: fetchProfile,
    saveProfile,
  };
}

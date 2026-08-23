"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { DoctorDto } from "@/lib/types";

export function useDoctorProfile() {
  const [profile, setProfile] = useState<DoctorDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<DoctorDto>("/doctors/me", { signal });
      if (!signal?.aborted) setProfile(data);
    } catch (err: any) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!signal?.aborted) {
        // 404 means the doctor profile doesn't exist yet (onboarding flow)
        if (err instanceof ApiError && err.status === 404) {
          setProfile(null);
        } else {
          setError(err instanceof ApiError ? err.message : "Couldn't load your profile.");
        }
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);
    return () => controller.abort();
  }, [fetchProfile]);

  const saveProfile = async (payload: Partial<DoctorDto>): Promise<DoctorDto> => {
    const updated = await apiFetch<DoctorDto>("/doctors/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setProfile(updated);
    return updated;
  };

  return { 
    profile, 
    loading, 
    error, 
    refetch: fetchProfile, 
    saveProfile 
  };
}
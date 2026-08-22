"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { DoctorDto, AvailabilityDto } from "@/lib/types";

export function useDoctors() {
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<DoctorDto[]>("/doctors");
      if (!signal?.aborted) setDoctors(data);
    } catch (err) {
      if (!signal?.aborted) {
        setError(
          err instanceof ApiError ? err.message : "Couldn't load doctors.",
        );
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDoctors(controller.signal);
    return () => controller.abort();
  }, [fetchDoctors]);

  function toLocalDateTimeParam(date: Date): string {
    return date.toISOString().slice(0, 19); // "2026-08-22T22:52:00"
  }

  const fetchDoctorSlots = async (
    doctorId: number,
  ): Promise<AvailabilityDto[]> => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 30);

    const params = new URLSearchParams({
      from: toLocalDateTimeParam(from),
      to: toLocalDateTimeParam(to),
    });

    return apiFetch<AvailabilityDto[]>(`/doctors/${doctorId}/slots?${params}`);
  };

  return { doctors, loading, error, refetch: fetchDoctors, fetchDoctorSlots };
}

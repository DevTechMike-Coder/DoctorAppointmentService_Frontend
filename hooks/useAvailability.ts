"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { AvailabilityDto } from "@/lib/types";

interface CreateSlotRequest {
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export function useAvailability(doctorId: number | null) {
  const [slots, setSlots] = useState<AvailabilityDto[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(doctorId));
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(
    async (signal?: AbortSignal) => {
      // Fix: Immediately set loading to false if no doctorId is present
      if (!doctorId) {
        setSlots([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const from = new Date();
        const to = new Date();
        to.setDate(to.getDate() + 30);

        const params = new URLSearchParams({
          from: from.toISOString().slice(0, 19),
          to: to.toISOString().slice(0, 19),
        });

        const data = await apiFetch<AvailabilityDto[]>(
          `/doctors/${doctorId}/slots?${params}`,
          { signal }
        );
        if (!signal?.aborted) setSlots(data);
      } catch (err: any) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!signal?.aborted) {
          setError(err instanceof ApiError ? err.message : "Couldn't load slots.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [doctorId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSlots(controller.signal);
    return () => controller.abort();
  }, [fetchSlots]);

  const createSlots = async (payload: CreateSlotRequest): Promise<AvailabilityDto[]> => {
    if (!doctorId) throw new Error("Doctor ID is missing");
    
    const created = await apiFetch<AvailabilityDto[]>(`/doctors/${doctorId}/slots`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSlots((prev) => 
      [...prev, ...created].sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    return created;
  };

  const deleteSlot = async (slotId: number): Promise<void> => {
    if (!doctorId) throw new Error("Doctor ID is missing");

    await apiFetch(`/doctors/${doctorId}/slots/${slotId}`, { method: "DELETE" });
    setSlots((prev) => prev.filter((s) => s.slotId !== slotId));
  };

  return { 
    slots, 
    loading, 
    error, 
    refetch: fetchSlots, 
    createSlots, 
    deleteSlot 
  };
}
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { toLocalDateTime } from "@/lib/datetime";
import type { AvailabilityDto, CreateSlotRequest } from "@/lib/types";

interface CreateSlotsInput {
  startTime: string; // "YYYY-MM-DDTHH:mm:ss"
  endTime: string;
  slotDurationMinutes: number;
}

/** Split a time range into consecutive slot windows of the given length. */
function splitIntoSlots(input: CreateSlotsInput): CreateSlotRequest[] {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);
  const stepMs = input.slotDurationMinutes * 60_000;

  const requests: CreateSlotRequest[] = [];
  for (let t = start.getTime(); t + stepMs <= end.getTime(); t += stepMs) {
    requests.push({
      startTime: toLocalDateTime(new Date(t)),
      endTime: toLocalDateTime(new Date(t + stepMs)),
    });
  }
  return requests;
}

export function useAvailability(doctorId: number | null) {
  const [slots, setSlots] = useState<AvailabilityDto[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(doctorId));
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(
    async (signal?: AbortSignal) => {
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
          from: toLocalDateTime(from),
          to: toLocalDateTime(to),
        });

        const data = await apiFetch<AvailabilityDto[]>(
          `/doctors/${doctorId}/slots?${params}`,
          { signal }
        );
        if (!signal?.aborted) setSlots(data);
      } catch (err) {
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

  /**
   * The backend creates ONE slot per POST ({ startTime, endTime }), so the
   * requested range is split client-side and created sequentially.
   */
  const createSlots = async (payload: CreateSlotsInput): Promise<AvailabilityDto[]> => {
    if (!doctorId) throw new Error("Doctor ID is missing");

    const requests = splitIntoSlots(payload);
    if (requests.length === 0) {
      throw new Error("End time must be at least one slot length after start time.");
    }

    const created: AvailabilityDto[] = [];
    try {
      for (const req of requests) {
        const slot = await apiFetch<AvailabilityDto>(`/doctors/${doctorId}/slots`, {
          method: "POST",
          body: JSON.stringify(req),
        });
        created.push(slot);
      }
    } finally {
      // Keep whatever was successfully created, even on partial failure.
      if (created.length > 0) {
        setSlots((prev) =>
          [...prev, ...created].sort((a, b) => a.startTime.localeCompare(b.startTime))
        );
      }
    }
    return created;
  };

  const deleteSlot = async (id: number): Promise<void> => {
    if (!doctorId) throw new Error("Doctor ID is missing");

    await apiFetch(`/doctors/${doctorId}/slots/${id}`, { method: "DELETE" });
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    slots,
    loading,
    error,
    refetch: fetchSlots,
    createSlots,
    deleteSlot,
  };
}

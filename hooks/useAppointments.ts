/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { AppointmentDto, BookAppointmentRequest } from "@/lib/types";

export function useAppointments() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AppointmentDto[]>("/appointments/me", { signal });
      if (!signal?.aborted) setAppointments(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!signal?.aborted) {
        setError(err instanceof ApiError ? err.message : "Couldn't load appointments.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAppointments(controller.signal);
    return () => controller.abort();
  }, [fetchAppointments]);

  const cancelAppointment = async (id: number): Promise<void> => {
    await apiFetch(`/appointments/${id}`, { method: "DELETE" });
    // The backend cancels (not deletes) the appointment — reflect that so it
    // shows up under the "Cancelled" tab instead of disappearing.
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
    );
  };

  const bookAppointment = async (payload: BookAppointmentRequest): Promise<AppointmentDto> => {
    const newAppointment = await apiFetch<AppointmentDto>("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  };

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    cancelAppointment,
    bookAppointment,
  };
}

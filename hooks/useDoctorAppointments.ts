"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { AppointmentDto, AppointmentStatus } from "@/lib/types";

export function useDoctorAppointments(doctorId: number | null) {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(doctorId));
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (signal?: AbortSignal) => {
      if (!doctorId) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<AppointmentDto[]>(
          `/appointments/doctor/${doctorId}`, 
          { signal }
        );
        if (!signal?.aborted) setAppointments(data);
      } catch (err: any) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!signal?.aborted) {
          setError(err instanceof ApiError ? err.message : "Couldn't load appointments.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [doctorId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAppointments(controller.signal);
    return () => controller.abort();
  }, [fetchAppointments]);

  const updateStatus = async (
    appointmentId: number, 
    status: AppointmentStatus
  ): Promise<AppointmentDto> => {
    const updated = await apiFetch<AppointmentDto>(`/appointments/${appointmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? updated : a))
    );

    return updated;
  };

  return { 
    appointments, 
    loading, 
    error, 
    refetch: fetchAppointments, 
    updateStatus 
  };
}
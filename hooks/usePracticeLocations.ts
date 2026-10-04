/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { PracticeLocationDto, PracticeLocationRequest } from "@/lib/types";

const PATH = "/doctors/profile/locations";

/**
 * The authenticated doctor's own workplace locations (GET/POST/PUT/DELETE /doctors/profile/locations).
 * Pass `enabled=false` until the doctor has a saved profile — the backend answers 409 to writes before that.
 * Mutations re-fetch the list because setting a primary changes other rows too.
 */
export function usePracticeLocations(enabled: boolean) {
  const [locations, setLocations] = useState<PracticeLocationDto[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setLocations([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<PracticeLocationDto[]>(PATH, { signal });
        if (!signal?.aborted) setLocations(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!signal?.aborted) {
          setError(err instanceof ApiError ? err.message : "Couldn't load your locations.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [enabled]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchLocations(controller.signal);
    return () => controller.abort();
  }, [fetchLocations]);

  /** Silent re-sync after a successful write (no loading flash). */
  const refresh = async () => {
    try {
      setLocations(await apiFetch<PracticeLocationDto[]>(PATH));
    } catch {
      await fetchLocations();
    }
  };

  const addLocation = async (payload: PracticeLocationRequest) => {
    const created = await apiFetch<PracticeLocationDto>(PATH, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await refresh();
    return created;
  };

  const updateLocation = async (id: number, payload: PracticeLocationRequest) => {
    const updated = await apiFetch<PracticeLocationDto>(`${PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    await refresh();
    return updated;
  };

  const deleteLocation = async (id: number) => {
    await apiFetch<void>(`${PATH}/${id}`, { method: "DELETE" });
    await refresh();
  };

  return { locations, loading, error, refetch: fetchLocations, addLocation, updateLocation, deleteLocation };
}

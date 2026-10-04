"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { usePracticeLocations } from "@/hooks/usePracticeLocations";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import { formatAddress, getCountryOptions, MAX_LOCATIONS } from "@/lib/location";
import type { PracticeLocationDto, PracticeLocationRequest } from "@/lib/types";

const INPUT =
  "w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs";

interface FormState {
  facilityName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
  primary: boolean;
}

const EMPTY_FORM: FormState = {
  facilityName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateRegion: "",
  postalCode: "",
  country: "",
  primary: false,
};

function toForm(loc: PracticeLocationDto): FormState {
  return {
    facilityName: loc.facilityName,
    addressLine1: loc.addressLine1,
    addressLine2: loc.addressLine2 ?? "",
    city: loc.city,
    stateRegion: loc.stateRegion ?? "",
    postalCode: loc.postalCode ?? "",
    country: loc.country,
    primary: loc.primary,
  };
}

const orNull = (v: string) => (v.trim() === "" ? null : v.trim());

/** Coordinates are not editable in the UI yet, so an edit carries the stored ones through unchanged. */
function toRequest(
  f: FormState,
  coords: { latitude: number | null; longitude: number | null } = { latitude: null, longitude: null }
): PracticeLocationRequest {
  return {
    facilityName: f.facilityName.trim(),
    addressLine1: f.addressLine1.trim(),
    addressLine2: orNull(f.addressLine2),
    city: f.city.trim(),
    stateRegion: orNull(f.stateRegion),
    postalCode: orNull(f.postalCode),
    country: f.country,
    latitude: coords.latitude,
    longitude: coords.longitude,
    primary: f.primary,
  };
}

/**
 * Doctor-only editor for workplace locations, shown on the profile page.
 * `hasProfile` gates it: the backend rejects locations until the profile has been saved once.
 */
export function PracticeLocationsManager({ hasProfile }: { hasProfile: boolean }) {
  const { locations, loading, error, addLocation, updateLocation, deleteLocation } =
    usePracticeLocations(hasProfile);
  const toast = useToast();

  // "new" = add form open, number = editing that location, null = closed.
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const atLimit = locations.length >= MAX_LOCATIONS;

  function openForm(id: number | "new") {
    setFormError(null);
    setConfirmDeleteId(null);
    setEditingId(id);
  }

  async function handleSubmit(values: FormState) {
    if (!/^[A-Za-z0-9 -]*$/.test(values.postalCode)) {
      setFormError("Postal code may only contain letters, digits, spaces and hyphens.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingId === "new") {
        await addLocation(toRequest(values));
        toast.success("Location added.");
      } else if (editingId !== null) {
        const existing = locations.find((l) => l.id === editingId);
        await updateLocation(editingId, toRequest(values, existing));
        toast.success("Location updated.");
      }
      setEditingId(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't save this location.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMakePrimary(loc: PracticeLocationDto) {
    setBusyId(loc.id);
    try {
      await updateLocation(loc.id, toRequest({ ...toForm(loc), primary: true }, loc));
      toast.success("Primary location updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update your primary location.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id);
    try {
      await deleteLocation(id);
      setConfirmDeleteId(null);
      toast.success("Location removed.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't remove this location.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      aria-labelledby="locations-heading"
      className="bg-white rounded-2xl border border-ink/10 p-8 shadow-xs"
    >
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <div>
          <h2 id="locations-heading" className="font-display text-xl font-bold text-ink flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal" />
            Where you practise
          </h2>
          <p className="text-sm text-ink/55 mt-1">
            Patients see these on your public page. Use your workplace address, not your home.
          </p>
        </div>
        {hasProfile && editingId === null && (
          <button
            type="button"
            onClick={() => openForm("new")}
            disabled={atLimit}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add location
          </button>
        )}
      </div>

      {!hasProfile ? (
        <p className="mt-5 text-sm text-ink/50 bg-canvas/60 border border-ink/5 rounded-xl px-4 py-3">
          Save your profile above first, then you can add where you practise.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {loading && <p className="text-sm text-ink/40">Loading locations…</p>}
          {error && <p className="text-sm text-rust font-medium">{error}</p>}

          {!loading && !error && locations.length === 0 && editingId !== "new" && (
            <p className="text-sm text-ink/50 bg-canvas/60 border border-ink/5 rounded-xl px-4 py-3">
              No locations yet. Add the clinic or hospital where patients will see you.
            </p>
          )}

          <ul className="space-y-3">
            {locations.map((loc) =>
              editingId === loc.id ? (
                <li key={loc.id}>
                  <LocationForm
                    key={loc.id}
                    initial={toForm(loc)}
                    showPrimary={!loc.primary}
                    saving={saving}
                    error={formError}
                    onSubmit={handleSubmit}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li
                  key={loc.id}
                  className={`rounded-xl border p-4 transition-opacity ${
                    loc.primary ? "border-teal/30 bg-teal-light/20" : "border-ink/10"
                  } ${busyId === loc.id ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-ink">{loc.facilityName}</p>
                        {loc.primary && (
                          <span className="text-[11px] font-semibold text-teal-dark bg-teal-light px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink/60 mt-0.5 break-words">{formatAddress(loc)}</p>
                    </div>

                    {confirmDeleteId === loc.id ? (
                      <div className="flex items-center gap-2 shrink-0 text-xs">
                        <span className="text-ink/60">Remove?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(loc.id)}
                          disabled={busyId === loc.id}
                          className="font-semibold text-rust hover:underline disabled:opacity-50"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="font-semibold text-ink/60 hover:underline"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        {!loc.primary && (
                          <IconButton
                            label="Make primary"
                            onClick={() => handleMakePrimary(loc)}
                            disabled={busyId !== null}
                          >
                            <Star className="w-4 h-4" />
                          </IconButton>
                        )}
                        <IconButton label="Edit location" onClick={() => openForm(loc.id)} disabled={busyId !== null}>
                          <Pencil className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          label="Remove location"
                          onClick={() => setConfirmDeleteId(loc.id)}
                          disabled={busyId !== null}
                          danger
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    )}
                  </div>
                </li>
              )
            )}
          </ul>

          <AnimatePresence>
            {editingId === "new" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <LocationForm
                  initial={EMPTY_FORM}
                  showPrimary={locations.length > 0}
                  saving={saving}
                  error={formError}
                  onSubmit={handleSubmit}
                  onCancel={() => setEditingId(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {atLimit && editingId === null && (
            <p className="text-xs text-ink/45">You&apos;ve reached the limit of {MAX_LOCATIONS} locations.</p>
          )}
        </div>
      )}
    </motion.section>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-ink/45 disabled:opacity-40 transition ${
        danger ? "hover:text-rust hover:bg-rust/5" : "hover:text-teal hover:bg-teal-light/40"
      }`}
    >
      {children}
    </button>
  );
}

function LocationForm({
  initial,
  showPrimary,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  initial: FormState;
  showPrimary: boolean;
  saving: boolean;
  error: string | null;
  onSubmit: (values: FormState) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormState>(initial);
  const countries = useMemo(() => getCountryOptions(), []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="rounded-xl border border-teal/30 bg-canvas/40 p-5 space-y-4"
    >
      <div>
        <label htmlFor="loc-facility" className="block text-sm font-medium text-ink mb-1.5">
          Facility name
        </label>
        <input
          id="loc-facility"
          required
          maxLength={150}
          value={values.facilityName}
          onChange={(e) => set("facilityName", e.target.value)}
          placeholder="City Heart Clinic"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="loc-line1" className="block text-sm font-medium text-ink mb-1.5">
          Address
        </label>
        <input
          id="loc-line1"
          required
          maxLength={200}
          value={values.addressLine1}
          onChange={(e) => set("addressLine1", e.target.value)}
          placeholder="Street address"
          autoComplete="off"
          className={`${INPUT} mb-2.5`}
        />
        <input
          id="loc-line2"
          maxLength={200}
          value={values.addressLine2}
          onChange={(e) => set("addressLine2", e.target.value)}
          placeholder="Building, floor, suite (optional)"
          aria-label="Address line 2"
          autoComplete="off"
          className={INPUT}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="loc-city" className="block text-sm font-medium text-ink mb-1.5">
            City
          </label>
          <input
            id="loc-city"
            required
            maxLength={100}
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="loc-state" className="block text-sm font-medium text-ink mb-1.5">
            State / region <span className="text-ink/40 font-normal">(optional)</span>
          </label>
          <input
            id="loc-state"
            maxLength={100}
            value={values.stateRegion}
            onChange={(e) => set("stateRegion", e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="loc-postal" className="block text-sm font-medium text-ink mb-1.5">
            Postal code <span className="text-ink/40 font-normal">(optional)</span>
          </label>
          <input
            id="loc-postal"
            maxLength={20}
            value={values.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="loc-country" className="block text-sm font-medium text-ink mb-1.5">
            Country
          </label>
          <select
            id="loc-country"
            required
            value={values.country}
            onChange={(e) => set("country", e.target.value)}
            className={INPUT}
          >
            <option value="" disabled>
              Select country
            </option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showPrimary && (
        <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            checked={values.primary}
            onChange={(e) => set("primary", e.target.checked)}
            className="w-4 h-4 accent-teal"
          />
          Make this my primary location
        </label>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 text-sm text-rust bg-rust/5 border border-rust/20 rounded-xl px-3.5 py-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-ink/15 text-ink/70 hover:text-ink text-sm font-medium px-5 py-2.5 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 transition shadow-sm"
        >
          {saving ? "Saving…" : "Save location"}
        </button>
      </div>
    </form>
  );
}

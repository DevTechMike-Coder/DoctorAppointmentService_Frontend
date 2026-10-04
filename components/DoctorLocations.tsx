import { ExternalLink, MapPin } from "lucide-react";
import { formatAddress, mapsUrl } from "@/lib/location";
import type { PracticeLocationDto } from "@/lib/types";

/** Public "where you'll be seen" card on a doctor's page. Renders nothing when there are no locations. */
export function DoctorLocations({ locations }: { locations: PracticeLocationDto[] }) {
  if (locations.length === 0) return null;

  return (
    <section
      aria-labelledby="doctor-locations-heading"
      className="mb-8 bg-white rounded-2xl border border-ink/10 p-6 shadow-xs"
    >
      <h2
        id="doctor-locations-heading"
        className="flex items-center gap-2 text-sm font-semibold text-ink mb-4"
      >
        <MapPin className="w-4 h-4 text-teal" />
        {locations.length > 1 ? "Locations" : "Location"}
      </h2>
      <ul className="space-y-4">
        {locations.map((loc) => (
          <li key={loc.id} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {loc.facilityName}
                {loc.primary && locations.length > 1 && (
                  <span className="ml-2 align-middle text-[11px] font-semibold text-teal-dark bg-teal-light px-2 py-0.5 rounded-full">
                    Main
                  </span>
                )}
              </p>
              <p className="text-sm text-ink/60 mt-0.5 break-words">{formatAddress(loc)}</p>
            </div>
            <a
              href={mapsUrl(loc)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-teal hover:text-teal-dark transition"
            >
              Map
              <ExternalLink className="w-3 h-3" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

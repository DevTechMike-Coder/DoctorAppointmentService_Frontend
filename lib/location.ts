import type { PracticeLocationDto } from "./types";

/** Mirrors the backend cap (PracticeLocationService.MAX_LOCATIONS_PER_DOCTOR). */
export const MAX_LOCATIONS = 10;

/** ISO 3166-1 alpha-2 codes. Display names come from Intl.DisplayNames, so no name table to maintain. */
const COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK " +
  "FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IR IS IT " +
  "JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML " +
  "MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM " +
  "PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD " +
  "TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW";

let displayNames: Intl.DisplayNames | null = null;

/** Human-readable country name for an ISO code; falls back to the code itself. */
export function countryName(code: string): string {
  try {
    displayNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Country options sorted by name. Computed on demand (client-side only, when the form opens). */
export function getCountryOptions(): { code: string; name: string }[] {
  return COUNTRY_CODES.split(" ")
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** "12 Marina Rd, Suite 4, Lagos, Lagos 100001, Nigeria" */
export function formatAddress(loc: PracticeLocationDto): string {
  const regionPostal = [loc.stateRegion, loc.postalCode].filter(Boolean).join(" ");
  return [loc.addressLine1, loc.addressLine2, loc.city, regionPostal, countryName(loc.country)]
    .filter(Boolean)
    .join(", ");
}

/** Opens the place in the viewer's maps app; prefers exact coordinates when the doctor supplied them. */
export function mapsUrl(loc: PracticeLocationDto): string {
  const query =
    loc.latitude != null && loc.longitude != null
      ? `${loc.latitude},${loc.longitude}`
      : `${loc.facilityName}, ${formatAddress(loc)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

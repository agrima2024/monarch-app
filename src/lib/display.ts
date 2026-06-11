import type { Claim, Location, LocationWithClaim } from "./types";

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${latDir}, ${Math.abs(lng).toFixed(3)}°${lngDir}`;
}

/** Claimed spots show the explorer's name; everything else is unexplored. */
export function getDisplayName(
  location: Location | LocationWithClaim,
  claim?: Claim | null
): string {
  const resolvedClaim =
    claim ?? ("claim" in location ? location.claim : undefined);
  if (resolvedClaim?.place_name) return resolvedClaim.place_name;
  return "Unexplored";
}

export function isUnexplored(location: LocationWithClaim): boolean {
  return !location.claim;
}

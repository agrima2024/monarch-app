import type { Claim, Location } from "./types";

const LEGACY_CLAIMS_KEY = "monarch-user-claims";
const LEGACY_LOCATIONS_KEY = "monarch-user-locations";

function claimsKey(userId: string): string {
  return `monarch-user-claims:${userId}`;
}

function locationsKey(userId: string): string {
  return `monarch-user-locations:${userId}`;
}

export function loadStoredClaims(userId: string): Claim[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(claimsKey(userId)) ??
      (userId === "current-user"
        ? localStorage.getItem(LEGACY_CLAIMS_KEY)
        : null);
    if (!raw) return [];
    return JSON.parse(raw) as Claim[];
  } catch {
    return [];
  }
}

export function saveStoredClaims(claims: Claim[], userId: string): void {
  if (typeof window === "undefined") return;
  try {
    const mine = claims.filter((c) => c.user_id === userId);
    localStorage.setItem(claimsKey(userId), JSON.stringify(mine));
  } catch {
    // ignore quota errors
  }
}

export function loadUserLocations(userId: string): Location[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(locationsKey(userId)) ??
      (userId === "current-user"
        ? localStorage.getItem(LEGACY_LOCATIONS_KEY)
        : null);
    if (!raw) return [];
    return JSON.parse(raw) as Location[];
  } catch {
    return [];
  }
}

export function saveUserLocations(
  locations: Location[],
  userId: string
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(locationsKey(userId), JSON.stringify(locations));
  } catch {
    // ignore quota errors
  }
}

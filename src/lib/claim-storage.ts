import type { Claim, Location } from "./types";

const CLAIMS_KEY = "monarch-user-claims";
const LOCATIONS_KEY = "monarch-user-locations";
export const CURRENT_USER_STORAGE_ID = "current-user";

export function loadStoredClaims(): Claim[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLAIMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Claim[];
  } catch {
    return [];
  }
}

export function saveStoredClaims(claims: Claim[]): void {
  if (typeof window === "undefined") return;
  try {
    const mine = claims.filter((c) => c.user_id === CURRENT_USER_STORAGE_ID);
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(mine));
  } catch {
    // ignore quota errors
  }
}

export function loadUserLocations(): Location[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Location[];
  } catch {
    return [];
  }
}

export function saveUserLocations(locations: Location[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
  } catch {
    // ignore quota errors
  }
}

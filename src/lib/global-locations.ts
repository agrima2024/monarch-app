import type { Location } from "./types";

const GLOBAL_LOCATIONS_KEY = "monarch-global-locations";

export function loadGlobalLocations(): Location[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GLOBAL_LOCATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Location[];
  } catch {
    return [];
  }
}

export function publishLocation(location: Location): void {
  if (typeof window === "undefined") return;
  const existing = loadGlobalLocations();
  const next = [
    ...existing.filter((item) => item.id !== location.id),
    location,
  ];
  localStorage.setItem(GLOBAL_LOCATIONS_KEY, JSON.stringify(next));
}

export function removeGlobalLocation(locationId: string): void {
  if (typeof window === "undefined") return;
  const next = loadGlobalLocations().filter((item) => item.id !== locationId);
  localStorage.setItem(GLOBAL_LOCATIONS_KEY, JSON.stringify(next));
}

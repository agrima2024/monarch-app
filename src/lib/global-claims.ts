import type { Claim } from "./types";

const GLOBAL_CLAIMS_KEY = "monarch-global-claims";

export function loadGlobalClaims(): Claim[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GLOBAL_CLAIMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Claim[];
  } catch {
    return [];
  }
}

export function publishClaim(claim: Claim): void {
  if (typeof window === "undefined") return;
  const existing = loadGlobalClaims();
  const next = [...existing.filter((item) => item.id !== claim.id), claim];
  localStorage.setItem(GLOBAL_CLAIMS_KEY, JSON.stringify(next));
}

export function removeGlobalClaim(claimId: string): void {
  if (typeof window === "undefined") return;
  const next = loadGlobalClaims().filter((item) => item.id !== claimId);
  localStorage.setItem(GLOBAL_CLAIMS_KEY, JSON.stringify(next));
}

export function removeGlobalClaimForLocation(locationId: string): void {
  if (typeof window === "undefined") return;
  const next = loadGlobalClaims().filter(
    (item) => item.location_id !== locationId
  );
  localStorage.setItem(GLOBAL_CLAIMS_KEY, JSON.stringify(next));
}

export function getClaimsForUser(userId: string, claims: Claim[]): Claim[] {
  return claims.filter((claim) => claim.user_id === userId);
}

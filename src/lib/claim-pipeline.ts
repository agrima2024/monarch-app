import type { Claim } from "./types";
import {
  applyReputationToClaims,
  expireDisgracedClaims,
  purgeVotesForClaim,
} from "./claim-votes";
import { normalizeClaim } from "./reputation";
import { loadStoredClaims, saveStoredClaims } from "./claim-storage";
import {
  loadGlobalClaims,
  publishClaim,
  removeGlobalClaim,
} from "./global-claims";
import { removeGlobalLocation } from "./global-locations";

/** Apply votes, expire old disgraces, and persist claim updates. */
export function processClaims(claims: Claim[]): Claim[] {
  const normalized = claims.map(normalizeClaim);
  const withReputation = applyReputationToClaims(normalized);
  const { active, expired } = expireDisgracedClaims(withReputation);

  if (expired.length === 0) return active;

  const expiredIds = new Set(expired.map((claim) => claim.id));

  for (const claim of expired) {
    removeGlobalClaim(claim.id);
    removeGlobalLocation(claim.location_id);
    purgeVotesForClaim(claim.id);

    const ownerClaims = loadStoredClaims(claim.user_id).filter(
      (item) => item.id !== claim.id
    );
    saveStoredClaims(ownerClaims, claim.user_id);
  }

  const remainingGlobal = loadGlobalClaims().filter(
    (claim) => !expiredIds.has(claim.id)
  );
  localStorage.setItem(
    "monarch-global-claims",
    JSON.stringify(remainingGlobal)
  );

  return active.filter((claim) => !expiredIds.has(claim.id));
}

export function persistClaimUpdate(claim: Claim): void {
  const normalized = normalizeClaim(claim);
  publishClaim(normalized);

  const ownerClaims = loadStoredClaims(normalized.user_id);
  const without = ownerClaims.filter((item) => item.id !== normalized.id);
  saveStoredClaims([...without, normalized], normalized.user_id);
}

export function persistAllClaims(claims: Claim[]): Claim[] {
  const processed = processClaims(claims);
  for (const claim of processed) {
    publishClaim(claim);
    const ownerStored = loadStoredClaims(claim.user_id);
    const merged = [
      ...ownerStored.filter((item) => item.id !== claim.id),
      claim,
    ];
    saveStoredClaims(merged, claim.user_id);
  }
  return processed;
}

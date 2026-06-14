import type { Claim, ClaimVote } from "./types";

/** Grace period before a disgraced monarch is dethroned. */
export const DISGRACE_PERIOD_DAYS = 30;
export const DISGRACE_PERIOD_MS = DISGRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export function computeNetScore(votes: ClaimVote[]): number {
  return votes.reduce(
    (sum, vote) => sum + (vote.vote_type === "up" ? 1 : -1),
    0
  );
}

export function applyReputationRules(
  claim: Claim,
  netScore: number,
  now = new Date()
): Claim {
  let disgraced_at = claim.disgraced_at ?? null;

  if (netScore < 0 && !disgraced_at) {
    disgraced_at = now.toISOString();
  } else if (netScore >= 0) {
    disgraced_at = null;
  }

  return {
    ...claim,
    net_score: netScore,
    disgraced_at,
  };
}

export function isDisgraced(claim: Claim): boolean {
  return claim.net_score < 0 && !!claim.disgraced_at;
}

export function daysUntilDethroned(claim: Claim): number | null {
  if (!claim.disgraced_at || claim.net_score >= 0) return null;
  const elapsed = Date.now() - new Date(claim.disgraced_at).getTime();
  const remaining = DISGRACE_PERIOD_MS - elapsed;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

export function isExpiredDisgrace(claim: Claim, now = Date.now()): boolean {
  if (!claim.disgraced_at || claim.net_score >= 0) return false;
  return now - new Date(claim.disgraced_at).getTime() >= DISGRACE_PERIOD_MS;
}

export function normalizeClaim(claim: Claim): Claim {
  return {
    ...claim,
    net_score: claim.net_score ?? 0,
    disgraced_at: claim.disgraced_at ?? null,
  };
}

export function withFreshClaimDefaults(
  claim: Omit<Claim, "net_score" | "disgraced_at">
): Claim {
  return {
    ...claim,
    net_score: 0,
    disgraced_at: null,
  };
}

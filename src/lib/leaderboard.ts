import { getExplorerTitle } from "./explorer-titles";
import { getUserProfile, getUsernameInitial } from "./user-registry";
import type { Claim, LeaderboardEntry } from "./types";

export function computeUserScore(claims: Claim[]): number {
  if (claims.length === 0) return 0;
  const territoryPoints = claims.length * 100;
  const reputationPoints = claims.reduce(
    (sum, claim) => sum + Math.max(claim.net_score, 0),
    0
  );
  return territoryPoints + reputationPoints;
}

export function buildLeaderboard(
  claims: Claim[],
  memberIds?: string[]
): LeaderboardEntry[] {
  const allowed = memberIds ? new Set(memberIds) : null;
  const byUser = new Map<string, Claim[]>();

  for (const claim of claims) {
    if (allowed && !allowed.has(claim.user_id)) continue;
    const existing = byUser.get(claim.user_id) ?? [];
    existing.push(claim);
    byUser.set(claim.user_id, existing);
  }

  const entries: LeaderboardEntry[] = [];

  for (const [userId, userClaims] of byUser) {
    const profile = getUserProfile(userId);
    const totalScore = computeUserScore(userClaims);
    entries.push({
      userId,
      username: profile?.username ?? userId,
      avatarInitial: getUsernameInitial(profile?.username ?? "?"),
      title: getExplorerTitle(totalScore),
      totalScore,
      territoryCount: userClaims.length,
      rank: 0,
    });
  }

  entries.sort((a, b) => b.totalScore - a.totalScore);
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

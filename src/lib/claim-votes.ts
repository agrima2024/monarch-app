import type { Claim, ClaimVote, VoteType } from "./types";
import {
  applyReputationRules,
  computeNetScore,
  isExpiredDisgrace,
  normalizeClaim,
} from "./reputation";

const VOTES_KEY = "monarch-claim-votes";

function loadAllVotes(): ClaimVote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClaimVote[];
  } catch {
    return [];
  }
}

function saveAllVotes(votes: ClaimVote[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

export function getVotesForClaim(claimId: string): ClaimVote[] {
  return loadAllVotes().filter((vote) => vote.claim_id === claimId);
}

export function getUserVoteForClaim(
  claimId: string,
  userId: string
): ClaimVote | undefined {
  return loadAllVotes().find(
    (vote) => vote.claim_id === claimId && vote.user_id === userId
  );
}

export function applyReputationToClaim(claim: Claim): Claim {
  const votes = getVotesForClaim(claim.id);
  const netScore = computeNetScore(votes);
  return applyReputationRules(normalizeClaim(claim), netScore);
}

export function applyReputationToClaims(claims: Claim[]): Claim[] {
  return claims.map(applyReputationToClaim);
}

export function expireDisgracedClaims(claims: Claim[]): {
  active: Claim[];
  expired: Claim[];
} {
  const active: Claim[] = [];
  const expired: Claim[] = [];

  for (const claim of applyReputationToClaims(claims)) {
    if (isExpiredDisgrace(claim)) {
      expired.push(claim);
    } else {
      active.push(claim);
    }
  }

  return { active, expired };
}

export function submitClaimVote(
  claimId: string,
  voterId: string,
  voteType: VoteType,
  claimOwnerId: string
): { error?: string } {
  if (voterId === claimOwnerId) {
    return { error: "You cannot vote on your own kingdom." };
  }

  const votes = loadAllVotes();
  const existingIndex = votes.findIndex(
    (vote) => vote.claim_id === claimId && vote.user_id === voterId
  );

  if (existingIndex >= 0 && votes[existingIndex].vote_type === voteType) {
    votes.splice(existingIndex, 1);
  } else if (existingIndex >= 0) {
    votes[existingIndex] = {
      ...votes[existingIndex],
      vote_type: voteType,
    };
  } else {
    votes.push({
      id: `vote-${crypto.randomUUID()}`,
      claim_id: claimId,
      user_id: voterId,
      vote_type: voteType,
      created_at: new Date().toISOString(),
    });
  }

  saveAllVotes(votes);
  return {};
}

export function purgeVotesForClaim(claimId: string): void {
  saveAllVotes(loadAllVotes().filter((vote) => vote.claim_id !== claimId));
}

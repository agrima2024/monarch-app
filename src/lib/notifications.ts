import { isDisgraced } from "./reputation";
import { getUserProfile } from "./user-registry";
import type { Claim } from "./types";

const MOCK_EVENTS = [
  "👑 @RivalExplorer has just seized the Global Crown at Lombard Street!",
  "⚔️ A rebellion brews at Dolores Park — endorse your allies!",
  "🏆 Season II ends in 47 days — defend your circle's rank!",
];

export function buildProclamations(
  claims: Claim[],
  currentUserId: string
): string[] {
  const messages: string[] = [];

  for (const claim of claims) {
    if (claim.user_id === currentUserId && isDisgraced(claim)) {
      messages.push(
        `⚠️ Your crown at ${claim.place_name} has entered a State of Rebellion (Needs Upvotes)!`
      );
    }
  }

  const recent = [...claims]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 4);

  for (const claim of recent) {
    if (claim.user_id === currentUserId) continue;
    const profile = getUserProfile(claim.user_id);
    messages.push(
      `👑 @${profile?.username ?? "explorer"} has claimed ${claim.place_name}!`
    );
  }

  return [...messages, ...MOCK_EVENTS];
}

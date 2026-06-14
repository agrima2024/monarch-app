"use client";

import { AlertTriangle, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  daysUntilDethroned,
  isDisgraced,
} from "@/lib/reputation";
import type { Claim, VoteType } from "@/lib/types";

interface ClaimVoteBarProps {
  claim: Claim;
  currentUserId: string;
  userVote?: VoteType | null;
  onVote: (voteType: VoteType) => void;
}

export function ClaimVoteBar({
  claim,
  currentUserId,
  userVote,
  onVote,
}: ClaimVoteBarProps) {
  const isOwner = claim.user_id === currentUserId;
  const disgraced = isDisgraced(claim);
  const daysLeft = daysUntilDethroned(claim);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">
            Kingdom reputation
          </p>
          <p
            className={`text-lg font-semibold tabular-nums ${
              claim.net_score < 0
                ? "text-red-300"
                : claim.net_score > 0
                  ? "text-emerald-300"
                  : "text-foreground"
            }`}
          >
            {claim.net_score > 0 ? "+" : ""}
            {claim.net_score}
          </p>
        </div>

        {!isOwner && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onVote("up")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                userVote === "up"
                  ? "bg-emerald-900/50 text-emerald-200 ring-1 ring-emerald-500/40"
                  : "bg-surface border border-gold/10 text-muted hover:text-emerald-200"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              Endorse
            </button>
            <button
              type="button"
              onClick={() => onVote("down")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                userVote === "down"
                  ? "bg-red-950/50 text-red-200 ring-1 ring-red-500/40"
                  : "bg-surface border border-gold/10 text-muted hover:text-red-200"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              Rebel
            </button>
          </div>
        )}
      </div>

      {disgraced && daysLeft !== null && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/30 border border-red-500/25">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-300 uppercase tracking-wide">
              Disgraced
            </p>
            <p className="text-sm text-red-200/90 mt-0.5">
              {isOwner
                ? `Your crown is at risk! ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to restore your reputation before this land is unclaimed.`
                : `This monarch has ${daysLeft} day${daysLeft === 1 ? "" : "s"} to recover before the kingdom falls.`}
            </p>
          </div>
        </div>
      )}

      {!isOwner && (
        <p className="text-[10px] text-muted">
          Vote to endorse or rebel. If reputation stays negative for 30 days, the
          claim is removed.
        </p>
      )}
    </div>
  );
}

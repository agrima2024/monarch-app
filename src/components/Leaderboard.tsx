"use client";

import { Crown, X } from "lucide-react";
import { getMonarchColor } from "@/lib/monarch-colors";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardProps {
  open: boolean;
  onClose: () => void;
  title: string;
  entries: LeaderboardEntry[];
}

const RANK_STYLES: Record<number, string> = {
  1: "bg-gradient-to-r from-amber-500/25 to-yellow-600/10 border-amber-400/40",
  2: "bg-gradient-to-r from-zinc-400/20 to-zinc-500/10 border-zinc-300/30",
  3: "bg-gradient-to-r from-orange-700/25 to-amber-900/10 border-orange-500/35",
};

export function Leaderboard({
  open,
  onClose,
  title,
  entries,
}: LeaderboardProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close leaderboard"
        onClick={onClose}
        className={`fixed inset-0 z-[7100] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 z-[7200] flex w-[min(100vw,360px)] flex-col bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl transition-transform duration-300 ease-out bottom-[var(--bottom-nav-offset)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-[10px] text-muted uppercase tracking-widest">
                Explorer Rankings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-2">
          {entries.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              No explorers ranked yet. Claim territory to appear here!
            </p>
          ) : (
            entries.map((entry) => {
              const color = getMonarchColor(entry.userId);
              const rankStyle =
                RANK_STYLES[entry.rank] ??
                "bg-zinc-900/60 border-zinc-800/80";

              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 rounded-2xl border p-3 ${rankStyle}`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-gold border border-zinc-700">
                    {entry.rank}
                  </div>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-background border-2"
                    style={{
                      background: color.fill,
                      borderColor: color.stroke,
                    }}
                  >
                    {entry.avatarInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">@{entry.username}</p>
                    <p className="text-[11px] text-muted truncate">
                      {entry.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold tabular-nums text-gold">
                      {entry.totalScore}
                    </p>
                    <p className="text-[10px] text-muted">
                      {entry.territoryCount} lands
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}

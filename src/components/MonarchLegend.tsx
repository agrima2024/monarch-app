"use client";

import { getMonarchColor } from "@/lib/monarch-colors";
import { getProfileById } from "@/lib/dummy-data";

interface MonarchLegendProps {
  activeUserIds: string[];
  selectedUserId?: string | null;
  onSelectProfile: (userId: string) => void;
}

export function MonarchLegend({
  activeUserIds,
  selectedUserId,
  onSelectProfile,
}: MonarchLegendProps) {
  const entries = activeUserIds
    .map((id) => {
      const profile = getProfileById(id);
      const color = getMonarchColor(id);
      return { id, username: profile?.username ?? color.label, color };
    })
    .filter(
      (entry, index, arr) =>
        arr.findIndex((e) => e.id === entry.id) === index
    );

  if (entries.length === 0) return null;

  return (
    <div className="absolute bottom-24 right-3 z-[1000] bg-surface-elevated/95 backdrop-blur-md rounded-xl border border-gold/15 shadow-xl p-3 min-w-[148px]">
      <p className="text-[10px] uppercase tracking-widest text-muted mb-2">
        Monarchs
      </p>
      <ul className="space-y-1">
        {entries.map(({ id, username, color }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelectProfile(id)}
              className={`w-full flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 transition-colors ${
                selectedUserId === id
                  ? "bg-surface ring-1 ring-gold/30"
                  : "hover:bg-surface"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full shrink-0 border border-white/20"
                style={{ backgroundColor: color.fill }}
              />
              <span className="truncate">@{username}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 pt-2 border-t border-gold/10 flex items-center gap-2 text-[10px] text-muted">
        <span className="h-2.5 w-2.5 rounded-full border border-dashed border-muted/50 shrink-0" />
        Unexplored
      </div>
    </div>
  );
}

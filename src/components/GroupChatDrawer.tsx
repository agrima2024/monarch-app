"use client";

import { MapPin, Send, X } from "lucide-react";
import { useState } from "react";
import { FRIENDS_CIRCLE_ID, useGroups } from "@/contexts/GroupsContext";
import { useAuth } from "@/contexts/AuthContext";
import { getSeasonInfo } from "@/lib/seasons";
import { getUserProfile } from "@/lib/user-registry";

interface GroupChatDrawerProps {
  open: boolean;
  onClose: () => void;
  onFlyToLink?: (lat: number, lng: number, label: string) => void;
}

export function GroupChatDrawer({
  open,
  onClose,
  onFlyToLink,
}: GroupChatDrawerProps) {
  const { user } = useAuth();
  const { selectedGroupId, groups, messages, sendMessage } = useGroups();
  const [draft, setDraft] = useState("");
  const season = getSeasonInfo();

  const groupName =
    selectedGroupId === FRIENDS_CIRCLE_ID
      ? "Friends Circle"
      : groups.find((group) => group.id === selectedGroupId)?.name ??
        "Circle Chat";

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close group chat"
        onClick={onClose}
        className={`fixed inset-0 z-[6600] bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 z-[6700] h-full w-[min(100vw,340px)] bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-semibold">{groupName}</h2>
            <p className="text-[10px] text-muted uppercase tracking-widest">
              Strategy channel · {season.label} · {season.daysRemaining}d left
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[calc(100%-8.5rem)]">
          {messages.length === 0 ? (
            <p className="text-sm text-muted">
              Coordinate territory strategy here. Share coordinate links to rally
              your circle for rescue upvotes.
            </p>
          ) : (
            messages.map((message) => {
              const author = getUserProfile(message.user_id);
              const isSelf = message.user_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`rounded-xl px-3 py-2 max-w-[90%] ${
                    isSelf
                      ? "ml-auto bg-accent-purple/20 border border-accent-purple/30"
                      : "bg-zinc-900/80 border border-zinc-800"
                  }`}
                >
                  <p className="text-[10px] text-muted mb-1">
                    @{author?.username ?? "explorer"}
                  </p>
                  <p className="text-sm">{message.text}</p>
                  {message.link_lat != null && message.link_lng != null && (
                    <button
                      type="button"
                      onClick={() =>
                        onFlyToLink?.(
                          message.link_lat!,
                          message.link_lng!,
                          message.link_label ?? "Shared location"
                        )
                      }
                      className="mt-2 flex items-center gap-1 text-xs text-gold hover:underline"
                    >
                      <MapPin className="h-3 w-3" />
                      {message.link_label ?? "View on map"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-zinc-800 bg-zinc-950/90">
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
              placeholder="Rally your circle…"
              className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm outline-none focus:border-gold/40"
            />
            <button
              type="button"
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-background shadow-[0_0_15px_rgba(251,191,36,0.35)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

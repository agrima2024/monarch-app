"use client";

import { ChevronDown, MessageCircle, Users } from "lucide-react";
import { useState } from "react";
import { FRIENDS_CIRCLE_ID, useGroups } from "@/contexts/GroupsContext";
import { useFriendships } from "@/contexts/FriendshipsContext";
import type { CircleGroup, MapTab } from "@/lib/types";

interface GroupSelectorProps {
  activeTab: MapTab;
  onTabChange: (tab: MapTab) => void;
  groups: CircleGroup[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onOpenGroupChat: () => void;
}

export function GroupSelector({
  activeTab,
  onTabChange,
  groups,
  selectedGroupId,
  onSelectGroup,
  onOpenGroupChat,
}: GroupSelectorProps) {
  const [open, setOpen] = useState(false);
  const { friendIds } = useFriendships();
  const { createCircleGroup } = useGroups();

  const selectedName =
    selectedGroupId === FRIENDS_CIRCLE_ID
      ? "Friends Circle"
      : groups.find((group) => group.id === selectedGroupId)?.name ??
        "Friends Circle";

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-1 shadow-lg">
        <button
          type="button"
          onClick={() => onTabChange("community")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === "community"
              ? "bg-gold text-background shadow-[0_0_15px_rgba(251,191,36,0.35)]"
              : "text-muted hover:text-foreground"
          }`}
        >
          Community
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              onTabChange("friends");
              setOpen((prev) => !prev);
            }}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "friends"
                ? "bg-accent-purple text-white shadow-md"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span className="max-w-[88px] truncate">{selectedName}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>

          {open && activeTab === "friends" && (
            <div className="absolute top-full left-0 mt-2 min-w-[180px] rounded-xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 shadow-xl overflow-hidden z-[2000]">
              <button
                type="button"
                onClick={() => {
                  onSelectGroup(FRIENDS_CIRCLE_ID);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-zinc-800/80 ${
                  selectedGroupId === FRIENDS_CIRCLE_ID
                    ? "text-gold"
                    : "text-foreground"
                }`}
              >
                Friends Circle
              </button>
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    onSelectGroup(group.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-zinc-800/80 ${
                    selectedGroupId === group.id
                      ? "text-gold"
                      : "text-foreground"
                  }`}
                >
                  {group.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const name = window.prompt("Name your explorer circle:");
                  if (!name) return;
                  const error = createCircleGroup(name, friendIds);
                  if (error) window.alert(error);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-gold border-t border-zinc-800 hover:bg-zinc-800/80"
              >
                + New Circle
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === "friends" && (
        <button
          type="button"
          aria-label="Open group chat"
          onClick={onOpenGroupChat}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 text-gold shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:brightness-110 transition-all"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

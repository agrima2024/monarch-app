"use client";

import { Crown } from "lucide-react";
import type { MapTab } from "@/lib/types";

interface TabToggleProps {
  activeTab: MapTab;
  onTabChange: (tab: MapTab) => void;
}

export function TabToggle({ activeTab, onTabChange }: TabToggleProps) {
  return (
    <div className="flex rounded-full bg-surface-elevated p-1 border border-gold/20 shadow-lg">
      <button
        type="button"
        onClick={() => onTabChange("community")}
        className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          activeTab === "community"
            ? "bg-gold text-background shadow-md"
            : "text-muted hover:text-foreground"
        }`}
      >
        Community
      </button>
      <button
        type="button"
        onClick={() => onTabChange("friends")}
        className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
          activeTab === "friends"
            ? "bg-accent-purple text-white shadow-md"
            : "text-muted hover:text-foreground"
        }`}
      >
        <Crown className="h-3.5 w-3.5" />
        Friends
      </button>
    </div>
  );
}

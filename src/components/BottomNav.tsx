"use client";

import { Map, User } from "lucide-react";

export type AppTab = "map" | "account";

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  pendingRequests?: number;
}

export function BottomNav({
  activeTab,
  onTabChange,
  pendingRequests = 0,
}: BottomNavProps) {
  return (
    <nav
      className="shrink-0 border-t border-gold/10 bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Main navigation"
    >
      <div className="flex">
        <button
          type="button"
          onClick={() => onTabChange("map")}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            activeTab === "map"
              ? "text-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Map className="h-5 w-5" />
          Map
        </button>
        <button
          type="button"
          onClick={() => onTabChange("account")}
          className={`relative flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            activeTab === "account"
              ? "text-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          Account
          {pendingRequests > 0 && (
            <span className="absolute top-2 right-[calc(50%-28px)] h-4 min-w-4 px-1 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center">
              {pendingRequests}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

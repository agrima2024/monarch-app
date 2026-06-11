"use client";

import { Crown } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface/80 backdrop-blur-md border-b border-gold/10">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-lg shadow-gold/20">
          <Crown className="h-5 w-5 text-background crown-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight shimmer-text">
            Monarch
          </h1>
          <p className="text-[10px] text-muted uppercase tracking-widest">
            Claim Your Kingdom
          </p>
        </div>
      </div>
    </header>
  );
}

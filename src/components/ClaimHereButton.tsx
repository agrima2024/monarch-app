"use client";

import { Crown } from "lucide-react";

interface ClaimHereButtonProps {
  onClaim: () => void;
}

export function ClaimHereButton({ onClaim }: ClaimHereButtonProps) {
  return (
    <button
      type="button"
      onClick={onClaim}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-gold to-gold-dark text-background font-semibold text-sm shadow-xl shadow-gold/30 hover:shadow-gold/50 active:scale-[0.98] transition-all pointer-events-auto"
    >
      <Crown className="h-4 w-4" />
      Claim territory here
    </button>
  );
}

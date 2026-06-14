"use client";

import { Crown } from "lucide-react";

interface ClaimHereButtonProps {
  onClaim: () => void;
  disabled?: boolean;
  raised?: boolean;
}

export function ClaimHereButton({
  onClaim,
  disabled,
  raised,
}: ClaimHereButtonProps) {
  return (
    <button
      type="button"
      onClick={onClaim}
      disabled={disabled}
      className={`fixed left-1/2 -translate-x-1/2 z-[5600] pointer-events-auto flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-gold to-gold-dark text-background font-semibold text-sm shadow-2xl shadow-gold/40 hover:shadow-gold/60 active:scale-[0.97] transition-all disabled:opacity-40 touch-manipulation ${
        raised ? "bottom-20" : "bottom-6"
      }`}
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <Crown className="h-5 w-5" />
      Claim territory here
    </button>
  );
}

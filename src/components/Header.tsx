"use client";

import { Crown, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface/80 backdrop-blur-md border-b border-gold/10">
      <Link href="/" className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-lg shadow-gold/20">
          <Crown className="h-5 w-5 text-background crown-pulse" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight shimmer-text">
            Monarch
          </h1>
          <p className="text-[10px] text-muted uppercase tracking-widest truncate">
            Claim Your Kingdom
          </p>
        </div>
      </Link>

      {user && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-muted uppercase tracking-wide">
              Signed in
            </p>
            <p className="text-sm font-medium truncate max-w-[120px]">
              @{user.username}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface border border-gold/10 text-xs text-muted hover:text-foreground hover:border-gold/30 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
}

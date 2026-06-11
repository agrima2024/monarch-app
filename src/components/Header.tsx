"use client";

import { Crown, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FriendsPanel } from "@/components/FriendsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendships } from "@/contexts/FriendshipsContext";

export function Header() {
  const { user, signOut } = useAuth();
  const { incoming } = useFriendships();
  const router = useRouter();
  const [showFriends, setShowFriends] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <>
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
            <button
              type="button"
              onClick={() => setShowFriends(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface border border-gold/10 text-xs text-muted hover:text-foreground hover:border-gold/30 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Friends</span>
              {incoming.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center">
                  {incoming.length}
                </span>
              )}
            </button>

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

      {showFriends && <FriendsPanel onClose={() => setShowFriends(false)} />}
    </>
  );
}

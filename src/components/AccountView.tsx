"use client";

import {
  Check,
  Crown,
  Loader2,
  LogOut,
  MapPin,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendships } from "@/contexts/FriendshipsContext";
import { notifyDataChanged } from "@/lib/app-events";
import { loadStoredClaims, saveStoredClaims } from "@/lib/claim-storage";
import { loadGlobalClaims, removeGlobalClaim } from "@/lib/global-claims";
import { removeGlobalLocation } from "@/lib/global-locations";
import { getMonarchColor } from "@/lib/monarch-colors";
import type { Claim } from "@/lib/types";
import { getUsernameInitial, getUserProfile } from "@/lib/user-registry";

interface AccountViewProps {
  onViewTerritoryOnMap?: (claimId: string) => void;
}

export function AccountView({ onViewTerritoryOnMap }: AccountViewProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const {
    friendIds,
    incoming,
    outgoing,
    requestFriend,
    acceptRequest,
    declineRequest,
  } = useFriendships();

  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadClaims = useCallback(() => {
    if (!user) return;
    const stored = loadStoredClaims(user.id);
    const global = loadGlobalClaims();
    const mine = new Map<string, Claim>();
    for (const claim of [...global, ...stored]) {
      if (claim.user_id === user.id) mine.set(claim.id, claim);
    }
    setMyClaims(
      [...mine.values()].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    );
  }, [user]);

  useEffect(() => {
    reloadClaims();
    const handler = () => reloadClaims();
    window.addEventListener("monarch-data-changed", handler);
    return () => window.removeEventListener("monarch-data-changed", handler);
  }, [reloadClaims]);

  if (!user) return null;

  const color = getMonarchColor(user.id);
  const initial = getUsernameInitial(user.username);

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    const message = await requestFriend(username);
    if (message) setError(message);
    else {
      setInfo(`Request sent to @${username.trim().replace(/^@/, "")}.`);
      setUsername("");
    }
    setIsSubmitting(false);
  };

  const handleDeleteClaim = (claim: Claim) => {
    removeGlobalClaim(claim.id);
    removeGlobalLocation(claim.location_id);
    const remaining = loadStoredClaims(user.id).filter(
      (item) => item.id !== claim.id
    );
    saveStoredClaims(remaining, user.id);
    notifyDataChanged();
    reloadClaims();
    setInfo(`Relinquished ${claim.place_name}.`);
  };

  return (
    <div className="absolute inset-0 overflow-y-auto bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 pb-8 space-y-6">
        {/* Profile */}
        <section className="rounded-2xl border border-gold/20 bg-surface-elevated p-5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold border-2"
              style={{
                backgroundColor: `${color.fill}33`,
                borderColor: color.stroke,
                color: color.fill,
              }}
            >
              {initial}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">
                Your account
              </p>
              <h2 className="text-xl font-bold">@{user.username}</h2>
              <p className="text-sm text-muted mt-0.5">
                {myClaims.length}{" "}
                {myClaims.length === 1 ? "territory" : "territories"} ·{" "}
                {friendIds.length}{" "}
                {friendIds.length === 1 ? "friend" : "friends"}
              </p>
            </div>
          </div>
        </section>

        {/* Add friend */}
        <section className="rounded-2xl border border-gold/20 bg-surface-elevated p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-gold" />
            Add friend
          </h3>
          <form onSubmit={handleRequest} className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter their username"
              className="flex-1 rounded-xl bg-surface border border-gold/10 px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:border-gold/40"
            />
            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="shrink-0 px-4 py-3 rounded-xl bg-gold text-background font-semibold text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send"
              )}
            </button>
          </form>
          <p className="text-xs text-muted">
            Both of you must accept before you share a Friends Circle on the
            map.
          </p>
        </section>

        {(error || info) && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              error
                ? "bg-red-950/30 border border-red-500/20 text-red-200"
                : "bg-emerald-950/30 border border-emerald-500/20 text-emerald-200"
            }`}
          >
            {error ?? info}
          </div>
        )}

        {/* Incoming requests — always visible section */}
        <section className="rounded-2xl border border-gold/20 bg-surface-elevated p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Friend requests
            {incoming.length > 0 && (
              <span className="ml-auto text-xs bg-gold text-background px-2 py-0.5 rounded-full font-bold">
                {incoming.length} new
              </span>
            )}
          </h3>

          {incoming.length === 0 ? (
            <p className="text-sm text-muted">No incoming requests right now.</p>
          ) : (
            <ul className="space-y-2">
              {incoming.map((friendship) => {
                const profile = getUserProfile(friendship.user_id);
                return (
                  <li
                    key={friendship.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-gold/10"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        @{profile?.username ?? "explorer"}
                      </p>
                      <p className="text-xs text-muted">Wants to be friends</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          setError(null);
                          const msg = await acceptRequest(friendship.id);
                          if (msg) setError(msg);
                          else setInfo("Friend request accepted!");
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-900/40 text-emerald-200 text-xs font-medium"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setError(null);
                          await declineRequest(friendship.id);
                        }}
                        className="p-2 rounded-lg bg-red-950/40 text-red-300"
                        aria-label="Decline"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {outgoing.length > 0 && (
            <div className="pt-2 border-t border-gold/10">
              <p className="text-xs uppercase tracking-widest text-muted mb-2">
                Sent — waiting for them
              </p>
              <ul className="space-y-2">
                {outgoing.map((friendship) => {
                  const profile = getUserProfile(friendship.friend_id);
                  return (
                    <li
                      key={friendship.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface border border-gold/10 text-sm"
                    >
                      <span>@{profile?.username ?? "explorer"}</span>
                      <span className="text-xs text-muted">Pending</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Friends list */}
        <section className="rounded-2xl border border-gold/20 bg-surface-elevated p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Friends
          </h3>
          {friendIds.length === 0 ? (
            <p className="text-sm text-muted">
              No friends yet. Add someone by username above, or tap a monarch
              on the map and hit &ldquo;Add friend&rdquo;.
            </p>
          ) : (
            <ul className="space-y-2">
              {friendIds.map((friendId) => {
                const profile = getUserProfile(friendId);
                return (
                  <li
                    key={friendId}
                    className="p-3 rounded-xl bg-surface border border-gold/10 text-sm font-medium"
                  >
                    @{profile?.username ?? "explorer"}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Territory */}
        <section className="rounded-2xl border border-gold/20 bg-surface-elevated p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            My territory
          </h3>
          {myClaims.length === 0 ? (
            <p className="text-sm text-muted">
              You haven&apos;t claimed any land yet. Go to the Map tab and tap
              &ldquo;Claim territory here&rdquo;.
            </p>
          ) : (
            <ul className="space-y-2">
              {myClaims.map((claim) => (
                <li
                  key={claim.id}
                  className="flex gap-2 p-3 rounded-xl bg-surface border border-gold/10"
                >
                  <MapPin
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: color.fill }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{claim.place_name}</p>
                    <p className="text-xs text-muted line-clamp-2 mt-0.5">
                      {claim.review_text}
                    </p>
                    {onViewTerritoryOnMap && (
                      <button
                        type="button"
                        onClick={() => onViewTerritoryOnMap(claim.id)}
                        className="text-xs text-gold mt-2 hover:underline"
                      >
                        View on map
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteClaim(claim)}
                    className="shrink-0 p-2 rounded-lg text-red-300 hover:bg-red-950/40"
                    aria-label={`Delete ${claim.place_name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.replace("/login");
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gold/10 text-muted hover:text-foreground hover:border-gold/30 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

"use client";

import {
  Check,
  Loader2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useFriendships } from "@/contexts/FriendshipsContext";
import { getUserProfile } from "@/lib/user-registry";

interface FriendsPanelProps {
  onClose: () => void;
}

export function FriendsPanel({ onClose }: FriendsPanelProps) {
  const {
    friendIds,
    incoming,
    outgoing,
    requestFriend,
    acceptRequest,
    declineRequest,
  } = useFriendships();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const message = await requestFriend(username);
    if (message) {
      setError(message);
    } else {
      setInfo(`Friend request sent to @${username.trim().replace(/^@/, "")}.`);
      setUsername("");
    }

    setIsSubmitting(false);
  };

  const handleAccept = async (friendshipId: string) => {
    setError(null);
    const message = await acceptRequest(friendshipId);
    if (message) setError(message);
  };

  const handleDecline = async (friendshipId: string) => {
    setError(null);
    const message = await declineRequest(friendshipId);
    if (message) setError(message);
  };

  return (
    <div className="fixed inset-0 z-[5700] flex items-end sm:items-center justify-center pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-surface-elevated rounded-2xl border border-gold/20 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            <h2 className="font-semibold">Friends</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface transition-colors"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 overflow-y-auto">
          <form onSubmit={handleRequest} className="space-y-3">
            <label htmlFor="friend-username" className="text-sm text-muted block">
              Add friend by username
            </label>
            <div className="flex gap-2">
              <input
                id="friend-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@explorer"
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
                  <UserPlus className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted">
              They must accept your request before you appear in each
              other&apos;s Friends Circle.
            </p>
          </form>

          {error && (
            <p className="text-sm text-red-300 bg-red-950/30 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {info && (
            <p className="text-sm text-emerald-200 bg-emerald-950/30 border border-emerald-500/20 rounded-xl px-3 py-2">
              {info}
            </p>
          )}

          {incoming.length > 0 && (
            <section>
              <h3 className="text-xs uppercase tracking-widest text-muted mb-2">
                Incoming requests
              </h3>
              <ul className="space-y-2">
                {incoming.map((friendship) => {
                  const profile = getUserProfile(friendship.user_id);
                  return (
                    <li
                      key={friendship.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-gold/10"
                    >
                      <span className="text-sm font-medium truncate">
                        @{profile?.username ?? "explorer"}
                      </span>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAccept(friendship.id)}
                          className="p-2 rounded-lg bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60"
                          aria-label="Accept"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecline(friendship.id)}
                          className="p-2 rounded-lg bg-red-950/40 text-red-300 hover:bg-red-950/60"
                          aria-label="Decline"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {outgoing.length > 0 && (
            <section>
              <h3 className="text-xs uppercase tracking-widest text-muted mb-2">
                Sent requests
              </h3>
              <ul className="space-y-2">
                {outgoing.map((friendship) => {
                  const profile = getUserProfile(friendship.friend_id);
                  return (
                    <li
                      key={friendship.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-gold/10"
                    >
                      <span className="text-sm truncate">
                        @{profile?.username ?? "explorer"}
                      </span>
                      <span className="text-xs text-muted shrink-0">Pending</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-xs uppercase tracking-widest text-muted mb-2">
              Your friends
            </h3>
            {friendIds.length === 0 ? (
              <p className="text-sm text-muted p-3 rounded-xl bg-surface border border-gold/10">
                No friends yet. Send a request to someone you know.
              </p>
            ) : (
              <ul className="space-y-2">
                {friendIds.map((friendId) => {
                  const profile = getUserProfile(friendId);
                  return (
                    <li
                      key={friendId}
                      className="p-3 rounded-xl bg-surface border border-gold/10 text-sm"
                    >
                      @{profile?.username ?? "explorer"}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

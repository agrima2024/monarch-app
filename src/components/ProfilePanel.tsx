"use client";

import {
  Check,
  Crown,
  Loader2,
  MapPin,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendships } from "@/contexts/FriendshipsContext";
import { getMonarchColor } from "@/lib/monarch-colors";
import { getUsernameInitial } from "@/lib/user-registry";
import type { Claim, LocationWithClaim, Profile } from "@/lib/types";

interface ProfilePanelProps {
  profile: Profile;
  claims: Claim[];
  locations: LocationWithClaim[];
  raised?: boolean;
  onClose: () => void;
  onSelectPlace: (location: LocationWithClaim) => void;
  onViewAllOnMap: () => void;
  onDeleteClaim: (claimId: string) => void;
}

export function ProfilePanel({
  profile,
  claims,
  locations,
  raised,
  onClose,
  onSelectPlace,
  onViewAllOnMap,
  onDeleteClaim,
}: ProfilePanelProps) {
  const { user } = useAuth();
  const {
    friendIds,
    incoming,
    outgoing,
    requestFriendById,
    acceptRequest,
    declineRequest,
  } = useFriendships();
  const [friendActionError, setFriendActionError] = useState<string | null>(
    null
  );
  const [friendActionInfo, setFriendActionInfo] = useState<string | null>(null);
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false);

  const color = getMonarchColor(profile.id);
  const initial = getUsernameInitial(profile.username);
  const isOwnProfile = user?.id === profile.id;
  const isFriend = friendIds.includes(profile.id);
  const incomingRequest = incoming.find(
    (friendship) => friendship.user_id === profile.id
  );
  const outgoingRequest = outgoing.find(
    (friendship) => friendship.friend_id === profile.id
  );

  const conqueredPlaces = claims
    .map((claim) => {
      const location = locations.find((l) => l.id === claim.location_id);
      return location ? { claim, location } : null;
    })
    .filter(Boolean) as { claim: Claim; location: LocationWithClaim }[];

  const handleRequestFriend = async () => {
    setFriendActionError(null);
    setFriendActionInfo(null);
    setIsFriendActionLoading(true);
    const message = await requestFriendById(profile.id);
    if (message) {
      setFriendActionError(message);
    } else {
      setFriendActionInfo(`Friend request sent to @${profile.username}.`);
    }
    setIsFriendActionLoading(false);
  };

  const handleAccept = async () => {
    if (!incomingRequest) return;
    setFriendActionError(null);
    setIsFriendActionLoading(true);
    const message = await acceptRequest(incomingRequest.id);
    if (message) setFriendActionError(message);
    setIsFriendActionLoading(false);
  };

  const handleDecline = async () => {
    if (!incomingRequest) return;
    setFriendActionError(null);
    setIsFriendActionLoading(true);
    const message = await declineRequest(incomingRequest.id);
    if (message) setFriendActionError(message);
    setIsFriendActionLoading(false);
  };

  return (
    <div
      className={`fixed left-0 right-0 z-[5600] mx-3 pointer-events-auto max-h-[70vh] ${
        raised ? "bottom-20" : "bottom-3"
      }`}
    >
      <div
        className="bg-surface-elevated/95 backdrop-blur-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
        style={{ borderColor: `${color.fill}55` }}
      >
        <div
          className="h-1 shrink-0"
          style={{
            background: `linear-gradient(90deg, ${color.fill}, ${color.stroke})`,
          }}
        />

        <div className="flex items-start justify-between p-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold border-2"
              style={{
                backgroundColor: `${color.fill}33`,
                borderColor: color.stroke,
                color: color.fill,
              }}
            >
              {initial}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted flex items-center gap-1">
                <User className="h-3 w-3" />
                Monarch
              </p>
              <h3 className="font-semibold text-lg">@{profile.username}</h3>
              <p className="text-xs text-muted">
                {conqueredPlaces.length}{" "}
                {conqueredPlaces.length === 1 ? "place" : "places"} conquered
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface transition-colors shrink-0"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>

        {!isOwnProfile && (
          <div className="px-4 pb-3 shrink-0 space-y-2">
            {isFriend ? (
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-sm text-emerald-200">
                <Check className="h-4 w-4" />
                Friends
              </div>
            ) : incomingRequest ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isFriendActionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-900/40 text-emerald-200 text-sm font-medium hover:bg-emerald-900/60 disabled:opacity-50"
                >
                  {isFriendActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Accept friend
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={isFriendActionLoading}
                  className="px-4 py-2.5 rounded-xl bg-red-950/40 text-red-300 hover:bg-red-950/60 disabled:opacity-50"
                  aria-label="Decline"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : outgoingRequest ? (
              <div className="py-2.5 rounded-xl bg-surface border border-gold/10 text-sm text-muted text-center">
                Friend request sent — waiting for @
                {profile.username} to accept
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestFriend}
                disabled={isFriendActionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-background font-semibold text-sm shadow-lg shadow-gold/20 hover:shadow-gold/40 disabled:opacity-50"
              >
                {isFriendActionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
                Add friend
              </button>
            )}

            {friendActionError && (
              <p className="text-xs text-red-300">{friendActionError}</p>
            )}
            {friendActionInfo && (
              <p className="text-xs text-emerald-200">{friendActionInfo}</p>
            )}
          </div>
        )}

        {conqueredPlaces.length > 0 ? (
          <>
            <div className="px-4 pb-2 shrink-0">
              <button
                type="button"
                onClick={onViewAllOnMap}
                className="w-full py-2 rounded-lg text-xs font-medium border transition-colors hover:opacity-90"
                style={{
                  borderColor: `${color.fill}44`,
                  color: color.fill,
                  backgroundColor: `${color.fill}12`,
                }}
              >
                View all on map
              </button>
            </div>

            <ul className="overflow-y-auto px-4 pb-4 space-y-2">
              {conqueredPlaces.map(({ claim, location }) => (
                <li key={claim.id} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectPlace(location)}
                    className="flex-1 text-left p-3 rounded-xl bg-surface border border-gold/10 hover:border-gold/30 transition-colors min-w-0"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: color.fill }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{claim.place_name}</p>
                        <p className="text-xs text-muted line-clamp-2 mt-0.5">
                          {claim.review_text}
                        </p>
                      </div>
                      <Crown
                        className="h-3.5 w-3.5 shrink-0 mt-1 opacity-60"
                        style={{ color: color.fill }}
                      />
                    </div>
                  </button>
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => onDeleteClaim(claim.id)}
                      className="shrink-0 px-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 hover:bg-red-950/50 transition-colors"
                      aria-label={`Delete claim at ${claim.place_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="px-4 pb-4">
            <p className="text-sm text-muted text-center py-4">
              No conquered land yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

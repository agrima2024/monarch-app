"use client";

import {
  Camera,
  Crown,
  MapPin,
  Star,
  User,
  X,
} from "lucide-react";
import { getUserProfile } from "@/lib/user-registry";
import { formatCoordinates, getDisplayName, isUnexplored } from "@/lib/display";
import { getMonarchColor } from "@/lib/monarch-colors";
import type { LocationWithClaim } from "@/lib/types";

interface LocationPanelProps {
  location: LocationWithClaim;
  canClaim: boolean;
  onClaim: () => void;
  onClose: () => void;
}

export function LocationPanel({
  location,
  canClaim,
  onClaim,
  onClose,
}: LocationPanelProps) {
  const claim = location.claim;
  const monarch = claim ? getUserProfile(claim.user_id) : null;
  const unexplored = isUnexplored(location);
  const displayName = getDisplayName(location);
  const monarchColor = claim ? getMonarchColor(claim.user_id) : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[5500] mx-3 mb-3 pointer-events-auto">
      <div
        className="bg-surface-elevated/95 backdrop-blur-md rounded-2xl border shadow-2xl overflow-hidden"
        style={
          monarchColor
            ? { borderColor: `${monarchColor.fill}55` }
            : { borderColor: "rgba(212,168,83,0.2)" }
        }
      >
        {monarchColor && (
          <div
            className="h-1"
            style={{ background: `linear-gradient(90deg, ${monarchColor.fill}, ${monarchColor.stroke})` }}
          />
        )}
        <div className="flex items-start justify-between p-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                unexplored ? "bg-surface" : "bg-gold/15"
              }`}
            >
              <MapPin
                className={`h-5 w-5 ${unexplored ? "text-muted" : "text-gold"}`}
              />
            </div>
            <div className="min-w-0">
              {unexplored ? (
                <>
                  <p className="text-xs text-muted uppercase tracking-wide">
                    Unexplored
                  </p>
                  <h3 className="font-semibold truncate">{displayName}</h3>
                  <p className="font-mono text-[11px] text-muted/70 truncate">
                    {formatCoordinates(location.latitude, location.longitude)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-gold uppercase tracking-wide">
                    Named by @{monarch?.username}
                  </p>
                  <h3 className="font-semibold truncate">{displayName}</h3>
                </>
              )}
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

        {claim && monarch ? (
          <div className="px-4 pb-4 space-y-3">
            <div
              className="flex items-center gap-2 p-3 rounded-xl border"
              style={{
                backgroundColor: `${monarchColor!.fill}18`,
                borderColor: `${monarchColor!.fill}44`,
              }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: `${monarchColor!.fill}33` }}
              >
                <Crown className="h-4 w-4" style={{ color: monarchColor!.fill }} />
              </div>
              <div>
                <p className="text-xs text-gold uppercase tracking-wide font-semibold">
                  Monarch
                </p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted" />
                  @{monarch.username}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-gold/10">
              <div className="flex items-center gap-1 mb-1.5">
                <Star className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs text-muted">Review</span>
              </div>
              <p className="text-sm leading-relaxed">{claim.review_text}</p>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4">
            <p className="text-sm text-muted mb-3">
              This spot is unexplored. Visit in person, name the place, and
              crown yourself Monarch!
            </p>
            {canClaim ? (
              <button
                type="button"
                onClick={onClaim}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-background font-semibold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all"
              >
                <Crown className="h-5 w-5" />
                Explore &amp; Claim Crown
              </button>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-gold/10 text-sm text-muted">
                <Camera className="h-4 w-4 shrink-0" />
                Get within 150m to explore this spot
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

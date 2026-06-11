"use client";

import { Crown, MapPin, User, X } from "lucide-react";
import { getUsernameInitial } from "@/lib/dummy-data";
import { getMonarchColor } from "@/lib/monarch-colors";
import type { Claim, LocationWithClaim, Profile } from "@/lib/types";

interface ProfilePanelProps {
  profile: Profile;
  claims: Claim[];
  locations: LocationWithClaim[];
  onClose: () => void;
  onSelectPlace: (location: LocationWithClaim) => void;
  onViewAllOnMap: () => void;
}

export function ProfilePanel({
  profile,
  claims,
  locations,
  onClose,
  onSelectPlace,
  onViewAllOnMap,
}: ProfilePanelProps) {
  const color = getMonarchColor(profile.id);
  const initial = getUsernameInitial(profile.username);

  const conqueredPlaces = claims
    .map((claim) => {
      const location = locations.find((l) => l.id === claim.location_id);
      return location ? { claim, location } : null;
    })
    .filter(Boolean) as { claim: Claim; location: LocationWithClaim }[];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] mx-3 mb-3 max-h-[70vh]">
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
                <li key={claim.id}>
                  <button
                    type="button"
                    onClick={() => onSelectPlace(location)}
                    className="w-full text-left p-3 rounded-xl bg-surface border border-gold/10 hover:border-gold/30 transition-colors"
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

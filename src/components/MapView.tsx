"use client";

import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getClaimsForUser,
  getUsernameInitial,
} from "@/lib/dummy-data";
import { getDisplayName } from "@/lib/display";
import { DATA_CHANGED_EVENT, notifyDataChanged } from "@/lib/app-events";
import {
  loadStoredClaims,
  loadUserLocations,
  saveStoredClaims,
  saveUserLocations,
} from "@/lib/claim-storage";
import { loadGlobalClaims, publishClaim, removeGlobalClaim } from "@/lib/global-claims";
import {
  loadGlobalLocations,
  publishLocation,
  removeGlobalLocation,
} from "@/lib/global-locations";
import {
  CLAIM_HERE_MIN_DISTANCE_METERS,
  CLAIM_RADIUS_METERS,
  haversineDistanceMeters,
  spotsNearUser,
  USER_MAP_ZOOM,
  venueBounds,
} from "@/lib/geo";
import { getMonarchColor } from "@/lib/monarch-colors";
import type { Claim, Location, LocationWithClaim, MapTab } from "@/lib/types";
import { ClaimCrownModal } from "./ClaimCrownModal";
import { ClaimHereButton } from "./ClaimHereButton";
import { LocationPanel } from "./LocationPanel";
import { MonarchLegend } from "./MonarchLegend";
import { ProfilePanel } from "./ProfilePanel";
import { TabToggle } from "./TabToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendships } from "@/contexts/FriendshipsContext";
import { getUserProfile } from "@/lib/user-registry";

const SF_CENTER: [number, number] = [37.7749, -122.4194];
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

function resolveMonarchClaims(
  claims: Claim[],
  tab: MapTab,
  userId: string,
  friendIds: string[]
): Map<string, Claim> {
  const circleIds = new Set([userId, ...friendIds]);

  if (tab === "community") {
    return new Map(claims.map((c) => [c.location_id, c]));
  }

  const friendClaims = claims.filter((c) => circleIds.has(c.user_id));
  const byLocation = new Map<string, Claim[]>();

  for (const claim of friendClaims) {
    const existing = byLocation.get(claim.location_id) ?? [];
    existing.push(claim);
    byLocation.set(claim.location_id, existing);
  }

  const result = new Map<string, Claim>();
  for (const [locationId, locationClaims] of byLocation) {
    const earliest = locationClaims.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];
    result.set(locationId, earliest);
  }

  return result;
}

function createPersonIcon(
  color: string,
  stroke: string,
  initial: string,
  size = 32
): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.45));">
      <div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid ${stroke};font-size:${size * 0.4}px;font-weight:700;color:#0c0a09;">${initial}</div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const CLAIM_HERE_PREFIX = "user-spot-";

function findLocationById(
  locations: Location[],
  locationId: string
): Location | undefined {
  return locations.find((l) => l.id === locationId);
}

interface MapViewProps {
  focusClaimId?: string | null;
  onFocusClaimHandled?: () => void;
  openProfileId?: string | null;
  onOpenProfileHandled?: () => void;
  hasBottomNav?: boolean;
}

export function MapView({
  focusClaimId,
  onFocusClaimHandled,
  openProfileId,
  onOpenProfileHandled,
  hasBottomNav,
}: MapViewProps = {}) {
  const { user } = useAuth();
  const { friendIds } = useFriendships();
  const currentUserId = user!.id;
  const currentUsername = user!.username;

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const zonesRef = useRef<L.Rectangle[]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const nearbyRef = useRef<L.Rectangle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasCenteredOnUser = useRef(false);

  const [activeTab, setActiveTab] = useState<MapTab>("community");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationWithClaim | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  const [claimingLocation, setClaimingLocation] =
    useState<LocationWithClaim | null>(null);
  const [nearbyUnexplored, setNearbyUnexplored] =
    useState<LocationWithClaim | null>(null);
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  }>({ lat: SF_CENTER[0], lng: SF_CENTER[1] });
  const [geoStatus, setGeoStatus] = useState<"pending" | "ok" | "denied">(
    "pending"
  );
  const [localLocations, setLocalLocations] = useState<Location[]>([]);
  const [userClaimedLocations, setUserClaimedLocations] = useState<Location[]>(
    []
  );
  const [sharedLocations, setSharedLocations] = useState<Location[]>([]);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  const allLocations = useMemo(() => {
    const seen = new Set<string>();
    const merged: Location[] = [];

    for (const loc of [
      ...sharedLocations,
      ...localLocations,
      ...userClaimedLocations,
    ]) {
      if (seen.has(loc.id)) continue;
      seen.add(loc.id);
      merged.push(loc);
    }

    return merged;
  }, [sharedLocations, localLocations, userClaimedLocations]);

  const monarchClaims = useMemo(
    () => resolveMonarchClaims(claims, activeTab, currentUserId, friendIds),
    [claims, activeTab, currentUserId, friendIds]
  );

  const locationsWithClaims: LocationWithClaim[] = useMemo(() => {
    const circleIds = new Set([currentUserId, ...friendIds]);

    return allLocations.map((loc) => {
      const claim = monarchClaims.get(loc.id);
      const globalClaim = claims.find((c) => c.location_id === loc.id);

      return {
        ...loc,
        claim,
        isMonarch: !!claim,
        ...(activeTab === "friends" &&
          globalClaim &&
          !circleIds.has(globalClaim.user_id) && {
            claim: undefined,
            isMonarch: false,
          }),
      };
    });
  }, [monarchClaims, claims, activeTab, allLocations, currentUserId, friendIds]);

  const conqueredLocations = useMemo(
    () => locationsWithClaims.filter((loc) => loc.claim),
    [locationsWithClaims]
  );

  const unexploredLocations = useMemo(
    () => locationsWithClaims.filter((loc) => !loc.claim),
    [locationsWithClaims]
  );

  const activeMonarchIds = useMemo(
    () => conqueredLocations.map((l) => l.claim!.user_id),
    [conqueredLocations]
  );

  const reloadUserData = useCallback(() => {
    const stored = loadStoredClaims(currentUserId);
    const storedLocations = loadUserLocations(currentUserId);
    const globalClaims = loadGlobalClaims();
    const globalLocations = loadGlobalLocations();

    const migratedClaims = stored.filter((c) => c.location_id !== "claim-here");
    const migratedLocations = storedLocations.filter(
      (l) => l.id !== "claim-here"
    );
    if (
      migratedClaims.length !== stored.length ||
      migratedLocations.length !== storedLocations.length
    ) {
      saveStoredClaims(migratedClaims, currentUserId);
      saveUserLocations(migratedLocations, currentUserId);
    }

    setUserClaimedLocations(migratedLocations);
    setSharedLocations(globalLocations);

    const mergedClaims = [...globalClaims];
    const claimIds = new Set(mergedClaims.map((claim) => claim.id));
    for (const claim of migratedClaims) {
      if (!claimIds.has(claim.id)) {
        mergedClaims.push(claim);
        claimIds.add(claim.id);
      }
    }

    setClaims(mergedClaims);
  }, [currentUserId]);

  useEffect(() => {
    reloadUserData();
    const handler = () => reloadUserData();
    window.addEventListener(DATA_CHANGED_EVENT, handler);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handler);
  }, [reloadUserData]);

  useEffect(() => {
    if (!focusClaimId || claims.length === 0) return;
    const claim = claims.find((item) => item.id === focusClaimId);
    if (!claim) return;
    const loc = findLocationById(allLocations, claim.location_id);
    const map = mapRef.current;
    if (!loc || !map) return;
    map.flyTo([loc.latitude, loc.longitude], USER_MAP_ZOOM, { duration: 0.8 });
    onFocusClaimHandled?.();
  }, [focusClaimId, claims, allLocations, onFocusClaimHandled]);

  useEffect(() => {
    if (!openProfileId) return;
    setSelectedLocation(null);
    setClaimingLocation(null);
    setSelectedProfileId(openProfileId);
    onOpenProfileHandled?.();
  }, [openProfileId, onOpenProfileHandled]);

  const currentUserProfile = useMemo(
    () =>
      getUserProfile(currentUserId) ?? {
        id: currentUserId,
        username: currentUsername,
        avatar_url: null,
        created_at: new Date().toISOString(),
      },
    [currentUserId, currentUsername]
  );

  const selectedProfile =
    selectedProfileId === currentUserId
      ? currentUserProfile
      : selectedProfileId
        ? getUserProfile(selectedProfileId)
        : undefined;

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }

    const fallback = setTimeout(() => setGeoStatus("denied"), 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(fallback);
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoStatus("ok");
      },
      () => {
        clearTimeout(fallback);
        setGeoStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 120000 }
    );

    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    setLocalLocations(spotsNearUser(userPosition.lat, userPosition.lng));
  }, [userPosition.lat, userPosition.lng]);

  useEffect(() => {
    let closest: LocationWithClaim | null = null;
    let closestDist = Infinity;

    for (const loc of unexploredLocations) {
      const dist = haversineDistanceMeters(
        userPosition.lat,
        userPosition.lng,
        loc.latitude,
        loc.longitude
      );
      if (dist <= CLAIM_RADIUS_METERS && dist < closestDist) {
        closest = loc;
        closestDist = dist;
      }
    }

    setNearbyUnexplored(closest);
  }, [userPosition, unexploredLocations]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      center: SF_CENTER,
      zoom: USER_MAP_ZOOM,
      zoomControl: false,
    });

    L.tileLayer(TILE_URL, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;
    map.on("click", () => {
      setSelectedLocation(null);
      setSelectedProfileId(null);
    });
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Center on user when location is first known
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPosition || hasCenteredOnUser.current) return;

    map.flyTo([userPosition.lat, userPosition.lng], USER_MAP_ZOOM, {
      duration: 1.2,
    });
    hasCenteredOnUser.current = true;
  }, [userPosition]);

  const openLocation = useCallback((location: LocationWithClaim) => {
    setSelectedLocation(location);
    setSelectedProfileId(null);
  }, []);

  const openProfile = useCallback((userId: string) => {
    setSelectedProfileId(userId);
    setSelectedLocation(null);
    setClaimingLocation(null);
  }, []);

  const flyToLocation = useCallback((location: LocationWithClaim) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([location.latitude, location.longitude], USER_MAP_ZOOM, {
      duration: 0.8,
    });
  }, []);

  const flyToUserLands = useCallback(
    (userId: string) => {
      const map = mapRef.current;
      if (!map) return;

      const userClaims = getClaimsForUser(userId, claims);
      const bounds = L.latLngBounds([]);

      for (const claim of userClaims) {
        const loc = allLocations.find((l) => l.id === claim.location_id);
        if (!loc) continue;
        const [[s, w], [n, e]] = venueBounds(loc.latitude, loc.longitude);
        bounds.extend([s, w]);
        bounds.extend([n, e]);
      }

      if (bounds.isValid()) {
        map.flyToBounds(bounds, {
          padding: [48, 48],
          maxZoom: USER_MAP_ZOOM,
          duration: 1,
        });
      }
    },
    [claims, allLocations]
  );

  // Render conquered zones + monarch person icons
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    zonesRef.current.forEach((z) => z.remove());
    zonesRef.current = [];
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    conqueredLocations.forEach((location) => {
      const claim = location.claim!;
      const monarch = getMonarchColor(claim.user_id);
      const profile = getUserProfile(claim.user_id);
      const placeName = getDisplayName(location);
      const initial = profile
        ? getUsernameInitial(profile.username)
        : monarch.label.charAt(0).toUpperCase();

      const zone = L.rectangle(venueBounds(location.latitude, location.longitude), {
        color: monarch.stroke,
        fillColor: monarch.fill,
        fillOpacity: selectedProfileId === claim.user_id ? 0.65 : 0.45,
        weight: selectedProfileId === claim.user_id ? 3 : 2,
        opacity: 0.9,
        className: "kingdom-zone",
      })
        .addTo(map)
        .on("mouseover", () => {
          zone.setStyle({ fillOpacity: 0.6, weight: 3 });
        })
        .on("mouseout", () => {
          const highlighted = selectedProfileId === claim.user_id;
          zone.setStyle({
            fillOpacity: highlighted ? 0.65 : 0.45,
            weight: highlighted ? 3 : 2,
          });
        })
        .on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          openLocation(location);
        });

      zone.bindTooltip(
        `<strong>${placeName}</strong><br/><span style="opacity:0.8">@${profile?.username ?? monarch.label}</span>`,
        { direction: "top", className: "monarch-tooltip", sticky: true }
      );

      zonesRef.current.push(zone);

      const marker = L.marker([location.latitude, location.longitude], {
        icon: createPersonIcon(monarch.fill, monarch.stroke, initial),
        zIndexOffset: 500,
      })
        .addTo(map)
        .on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          openProfile(claim.user_id);
        });

      marker.bindTooltip(`@${profile?.username ?? monarch.label}`, {
        direction: "top",
        offset: [0, -20],
        className: "monarch-tooltip",
      });

      markersRef.current.push(marker);
    });
  }, [conqueredLocations, openLocation, openProfile, selectedProfileId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (nearbyRef.current) {
      nearbyRef.current.remove();
      nearbyRef.current = null;
    }

    if (!nearbyUnexplored) return;

    nearbyRef.current = L.rectangle(
      venueBounds(nearbyUnexplored.latitude, nearbyUnexplored.longitude),
      {
        color: "#78716c",
        fillColor: "#57534e",
        fillOpacity: 0.12,
        weight: 1.5,
        opacity: 0.6,
        dashArray: "6 4",
        className: "uncharted-zone",
      }
    )
      .addTo(map)
      .on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        openLocation(nearbyUnexplored);
      });

    nearbyRef.current.bindTooltip("Unexplored", {
      permanent: true,
      direction: "center",
      className: "uncharted-tooltip",
    });
  }, [nearbyUnexplored, openLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const youColor = getMonarchColor(currentUserId);
    const youInitial = getUsernameInitial(currentUserProfile.username);

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
    } else {
      userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], {
        icon: createPersonIcon(youColor.fill, youColor.stroke, youInitial, 36),
        zIndexOffset: 2000,
      })
        .addTo(map)
        .on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          openProfile(currentUserId);
        });

      userMarkerRef.current.bindTooltip("You", {
        direction: "top",
        offset: [0, -22],
        className: "monarch-tooltip",
      });
    }
  }, [userPosition, openProfile, currentUserId, currentUserProfile.username]);

  const canClaimLocation = useCallback(
    (location: LocationWithClaim) => {
      if (location.claim) return false;
      if (
        location.id.startsWith(CLAIM_HERE_PREFIX) ||
        location.id.startsWith("nearby-")
      ) {
        return true;
      }
      return (
        haversineDistanceMeters(
          userPosition.lat,
          userPosition.lng,
          location.latitude,
          location.longitude
        ) <= CLAIM_RADIUS_METERS
      );
    },
    [userPosition]
  );

  const canClaimHere = useMemo(() => {
    const myClaims = claims.filter((c) => c.user_id === currentUserId);
    for (const claim of myClaims) {
      const loc = findLocationById(allLocations, claim.location_id);
      if (!loc) continue;
      if (
        haversineDistanceMeters(
          userPosition.lat,
          userPosition.lng,
          loc.latitude,
          loc.longitude
        ) <= CLAIM_HERE_MIN_DISTANCE_METERS
      ) {
        return false;
      }
    }
    return true;
  }, [claims, userPosition, allLocations, currentUserId]);

  const startClaimHere = useCallback(() => {
    setSelectedProfileId(null);
    setSelectedLocation(null);
    setClaimingLocation({
      id: `${CLAIM_HERE_PREFIX}${Date.now()}`,
      latitude: userPosition.lat,
      longitude: userPosition.lng,
    });
  }, [userPosition]);

  const handleClaimSuccess = (
    placeName: string,
    reviewText: string,
    photoPreview: string
  ) => {
    if (!claimingLocation) return;

    const claimedSpot: Location = {
      id: claimingLocation.id,
      latitude: claimingLocation.latitude,
      longitude: claimingLocation.longitude,
    };

    setUserClaimedLocations((prev) => {
      const next = [...prev.filter((l) => l.id !== claimedSpot.id), claimedSpot];
      saveUserLocations(next, currentUserId);
      return next;
    });
    publishLocation(claimedSpot);
    setSharedLocations((prev) => [
      ...prev.filter((l) => l.id !== claimedSpot.id),
      claimedSpot,
    ]);

    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      location_id: claimingLocation.id,
      user_id: currentUserId,
      place_name: placeName,
      photo_url: photoPreview,
      review_text: reviewText,
      created_at: new Date().toISOString(),
    };

    setClaims((prev) => {
      const next = [...prev.filter((c) => c.location_id !== newClaim.location_id), newClaim];
      saveStoredClaims(next, currentUserId);
      publishClaim(newClaim);
      return next;
    });
    notifyDataChanged();
    setClaimingLocation(null);
    setNearbyUnexplored(null);
    setSelectedLocation({
      ...claimingLocation,
      claim: newClaim,
      isMonarch: true,
    });
    setClaimToast(`Crowned at ${placeName}!`);
    window.setTimeout(() => setClaimToast(null), 4000);

    const map = mapRef.current;
    if (map) {
      map.flyTo(
        [claimingLocation.latitude, claimingLocation.longitude],
        USER_MAP_ZOOM,
        { duration: 0.8 }
      );
    }
  };

  const handleDeleteClaim = useCallback(
    (claimId: string) => {
      const claim = claims.find((item) => item.id === claimId);
      if (!claim || claim.user_id !== currentUserId) return;

      const locationId = claim.location_id;

      setClaims((prev) => {
        const next = prev.filter((item) => item.id !== claimId);
        saveStoredClaims(next, currentUserId);
        removeGlobalClaim(claimId);
        return next;
      });

      setUserClaimedLocations((prev) => {
        const next = prev.filter((loc) => loc.id !== locationId);
        saveUserLocations(next, currentUserId);
        return next;
      });
      removeGlobalLocation(locationId);
      setSharedLocations((prev) => prev.filter((loc) => loc.id !== locationId));

      if (selectedLocation?.id === locationId) {
        setSelectedLocation(null);
      }

      setClaimToast(`Relinquished ${claim.place_name}`);
      window.setTimeout(() => setClaimToast(null), 4000);
      notifyDataChanged();
    },
    [claims, currentUserId, selectedLocation?.id]
  );

  const conqueredCount = conqueredLocations.length;

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="absolute inset-0 z-0" />

      <div className="absolute inset-0 z-[1000] pointer-events-none">
        {geoStatus === "pending" && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-surface-elevated/90 text-[10px] text-muted border border-gold/10">
            Finding your location…
          </div>
        )}

        {claimToast && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gold/90 text-background text-xs font-semibold shadow-lg pointer-events-none">
            {claimToast}
          </div>
        )}

        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto">
          <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="absolute top-3 left-3 pointer-events-auto px-3 py-1.5 rounded-full bg-surface-elevated/90 backdrop-blur-sm border border-gold/10 text-xs text-muted">
          {activeTab === "community" ? "Global Kingdoms" : "Friends Circle"}
          <span className="ml-1.5 text-foreground font-medium">
            {conqueredCount} explored
          </span>
        </div>

        <div className="pointer-events-auto">
          <MonarchLegend
            activeUserIds={activeMonarchIds}
            selectedUserId={selectedProfileId}
            onSelectProfile={openProfile}
            raised={hasBottomNav}
          />
        </div>

        {selectedProfile && (
          <ProfilePanel
            profile={selectedProfile}
            claims={getClaimsForUser(selectedProfile.id, claims)}
            locations={locationsWithClaims}
            raised={hasBottomNav}
            onClose={() => setSelectedProfileId(null)}
            onSelectPlace={(loc) => {
              flyToLocation(loc);
              openLocation(loc);
            }}
            onViewAllOnMap={() => flyToUserLands(selectedProfile.id)}
            onDeleteClaim={handleDeleteClaim}
          />
        )}

        {selectedLocation && !selectedProfileId && (
          <LocationPanel
            location={selectedLocation}
            canClaim={canClaimLocation(selectedLocation)}
            isOwnClaim={selectedLocation.claim?.user_id === currentUserId}
            raised={hasBottomNav}
            onClaim={() => setClaimingLocation(selectedLocation)}
            onDeleteClaim={() => {
              const claimId = selectedLocation.claim?.id;
              if (claimId) handleDeleteClaim(claimId);
            }}
            onViewProfile={(userId) => {
              setSelectedLocation(null);
              openProfile(userId);
            }}
            onClose={() => setSelectedLocation(null)}
          />
        )}
      </div>

      {canClaimHere && !claimingLocation && (
        <ClaimHereButton onClaim={startClaimHere} raised={hasBottomNav} />
      )}

      {claimingLocation && (
        <ClaimCrownModal
          location={claimingLocation}
          onClose={() => setClaimingLocation(null)}
          onSuccess={handleClaimSuccess}
        />
      )}
    </div>
  );
}

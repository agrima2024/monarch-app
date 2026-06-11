const EARTH_RADIUS_METERS = 6371000;

export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** How close you must be to discover / claim a spot. */
export const CLAIM_RADIUS_METERS = 150;

/** Default zoom when centering on the user's location. */
export const USER_MAP_ZOOM = 17;

/** Footprint of an explored venue on the map (~cafe or shop size). */
export const VENUE_ZONE_WIDTH_METERS = 28;
export const VENUE_ZONE_DEPTH_METERS = 22;

/** Bounding box for the explored venue highlight. */
export function venueBounds(
  lat: number,
  lng: number
): [[number, number], [number, number]] {
  const latRad = (lat * Math.PI) / 180;
  const halfHeight = VENUE_ZONE_DEPTH_METERS / 2 / 111_320;
  const halfWidth =
    VENUE_ZONE_WIDTH_METERS / 2 / (111_320 * Math.cos(latRad));
  return [
    [lat - halfHeight, lng - halfWidth],
    [lat + halfHeight, lng + halfWidth],
  ];
}

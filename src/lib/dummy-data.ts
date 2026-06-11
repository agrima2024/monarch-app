import type { Claim, Friendship, Location, Profile } from "./types";

export const DUMMY_PROFILES: Profile[] = [
  {
    id: "user-1",
    username: "alex_explorer",
    avatar_url: null,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "user-2",
    username: "sam_wanderer",
    avatar_url: null,
    created_at: "2025-02-01T14:30:00Z",
  },
  {
    id: "user-3",
    username: "jordan_trails",
    avatar_url: null,
    created_at: "2025-02-20T09:15:00Z",
  },
  {
    id: "current-user",
    username: "you",
    avatar_url: null,
    created_at: "2025-03-01T08:00:00Z",
  },
];

export const CURRENT_USER_ID = "current-user";

export const DUMMY_FRIENDSHIPS: Friendship[] = [
  {
    id: "f1",
    user_id: CURRENT_USER_ID,
    friend_id: "user-1",
    status: "accepted",
  },
  {
    id: "f2",
    user_id: CURRENT_USER_ID,
    friend_id: "user-2",
    status: "accepted",
  },
];

/** Unnamed geographic points — coordinates only until explored. */
export const DUMMY_LOCATIONS: Location[] = [
  { id: "poi-1", latitude: 37.7763, longitude: -122.4237 },
  { id: "poi-2", latitude: 37.7694, longitude: -122.4862 },
  { id: "poi-3", latitude: 37.7614, longitude: -122.4241 },
  { id: "poi-4", latitude: 37.7596, longitude: -122.4269 },
  { id: "poi-5", latitude: 37.7955, longitude: -122.3937 },
  { id: "poi-6", latitude: 37.7799, longitude: -122.511 },
  { id: "poi-7", latitude: 37.7587, longitude: -122.4265 },
  { id: "poi-8", latitude: 37.8024, longitude: -122.4662 },
];

export const DUMMY_CLAIMS: Claim[] = [
  {
    id: "claim-1",
    location_id: "poi-1",
    user_id: "user-1",
    place_name: "Morning Ritual Cafe",
    photo_url: "/placeholder-claim.jpg",
    review_text:
      "The pour-over here is exceptional — bright citrus notes with a clean finish. Best enjoyed on the patio before the morning rush.",
    created_at: "2025-03-10T11:00:00Z",
  },
  {
    id: "claim-2",
    location_id: "poi-2",
    user_id: "user-2",
    place_name: "Hidden Garden Grove",
    photo_url: "/placeholder-claim.jpg",
    review_text:
      "The botanical garden section is a hidden gem. Visit on weekday mornings for peaceful walks among the cherry blossoms.",
    created_at: "2025-03-05T09:30:00Z",
  },
  {
    id: "claim-3",
    location_id: "poi-3",
    user_id: "user-1",
    place_name: "Corner Morning Bun",
    photo_url: "/placeholder-claim.jpg",
    review_text:
      "Their morning bun is legendary for a reason — flaky, caramelized, and worth the wait. Grab one before they sell out by noon.",
    created_at: "2025-02-28T08:45:00Z",
  },
  {
    id: "claim-4",
    location_id: "poi-5",
    user_id: "user-3",
    place_name: "Harbor Market Square",
    photo_url: "/placeholder-claim.jpg",
    review_text:
      "Saturday farmers market is the highlight — fresh oysters, artisan cheese, and bay views make this a perfect morning destination.",
    created_at: "2025-03-01T10:00:00Z",
  },
];

export function getFriendIds(userId: string): string[] {
  return DUMMY_FRIENDSHIPS.filter(
    (f) =>
      f.status === "accepted" &&
      (f.user_id === userId || f.friend_id === userId)
  ).map((f) => (f.user_id === userId ? f.friend_id : f.user_id));
}

export function getProfileById(id: string): Profile | undefined {
  return DUMMY_PROFILES.find((p) => p.id === id);
}

export function getClaimsForUser(userId: string, claims: Claim[]): Claim[] {
  return claims.filter((c) => c.user_id === userId);
}

export function getUsernameInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}


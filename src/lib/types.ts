export type FriendshipStatus = "pending" | "accepted";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

/** A geographic point — unnamed until a Monarch explores and names it. */
export interface Location {
  id: string;
  latitude: number;
  longitude: number;
}

export interface Claim {
  id: string;
  location_id: string;
  user_id: string;
  place_name: string;
  photo_url: string;
  review_text: string;
  created_at: string;
  profile?: Profile;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
}

export type MapTab = "community" | "friends";

export interface LocationWithClaim extends Location {
  claim?: Claim;
  isMonarch?: boolean;
}

export interface ValidationResult {
  approved: boolean;
  image_passed: boolean;
  text_passed: boolean;
  rejection_reason: string | null;
  royal_guard_message: string | null;
}

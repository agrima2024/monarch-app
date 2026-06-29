export type FriendshipStatus = "pending" | "accepted";

export type VoteType = "up" | "down";

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
  net_score: number;
  disgraced_at: string | null;
  profile?: Profile;
}

export interface ClaimVote {
  id: string;
  claim_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  invite_message?: string;
}

export type MapTab = "community" | "friends";

export interface CircleGroup {
  id: string;
  name: string;
  member_ids: string[];
  created_by: string;
  created_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  text: string;
  link_lat?: number;
  link_lng?: number;
  link_label?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarInitial: string;
  title: string;
  totalScore: number;
  territoryCount: number;
  rank: number;
}

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

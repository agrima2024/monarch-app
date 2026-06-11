import type { Friendship } from "./types";
import { findUserByUsername } from "./user-registry";

const FRIENDSHIPS_KEY = "monarch-friendships";

function loadAll(): Friendship[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FRIENDSHIPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Friendship[];
  } catch {
    return [];
  }
}

function saveAll(friendships: Friendship[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify(friendships));
}

function findBetween(userA: string, userB: string): Friendship | undefined {
  return loadAll().find(
    (friendship) =>
      (friendship.user_id === userA && friendship.friend_id === userB) ||
      (friendship.user_id === userB && friendship.friend_id === userA)
  );
}

export function getFriendshipsForUser(userId: string): Friendship[] {
  return loadAll().filter(
    (friendship) =>
      friendship.user_id === userId || friendship.friend_id === userId
  );
}

export function getAcceptedFriendIds(userId: string): string[] {
  return getFriendshipsForUser(userId)
    .filter((friendship) => friendship.status === "accepted")
    .map((friendship) =>
      friendship.user_id === userId
        ? friendship.friend_id
        : friendship.user_id
    );
}

export function getIncomingRequests(userId: string): Friendship[] {
  return loadAll().filter(
    (friendship) =>
      friendship.friend_id === userId && friendship.status === "pending"
  );
}

export function getOutgoingRequests(userId: string): Friendship[] {
  return loadAll().filter(
    (friendship) =>
      friendship.user_id === userId && friendship.status === "pending"
  );
}

export function sendFriendRequest(
  fromUserId: string,
  toUsername: string
): { friendship: Friendship } | { error: string } {
  const target = findUserByUsername(toUsername);
  if (!target) {
    return { error: "No explorer found with that username." };
  }

  if (target.id === fromUserId) {
    return { error: "You cannot friend yourself." };
  }

  const existing = findBetween(fromUserId, target.id);
  if (existing?.status === "accepted") {
    return { error: "You are already friends." };
  }

  if (existing?.status === "pending") {
    if (existing.user_id === fromUserId) {
      return { error: "Friend request already sent." };
    }
    return {
      error: "They already sent you a request — check your incoming requests.",
    };
  }

  const friendship: Friendship = {
    id: `friend-${crypto.randomUUID()}`,
    user_id: fromUserId,
    friend_id: target.id,
    status: "pending",
  };

  saveAll([...loadAll(), friendship]);
  return { friendship };
}

export function acceptFriendRequest(
  friendshipId: string,
  userId: string
): { error?: string } {
  const friendships = loadAll();
  const friendship = friendships.find((item) => item.id === friendshipId);

  if (!friendship) return { error: "Request not found." };
  if (friendship.friend_id !== userId) {
    return { error: "You can only accept requests sent to you." };
  }
  if (friendship.status !== "pending") {
    return { error: "This request is no longer pending." };
  }

  saveAll(
    friendships.map((item) =>
      item.id === friendshipId ? { ...item, status: "accepted" as const } : item
    )
  );
  return {};
}

export function declineFriendRequest(
  friendshipId: string,
  userId: string
): { error?: string } {
  const friendships = loadAll();
  const friendship = friendships.find((item) => item.id === friendshipId);

  if (!friendship) return { error: "Request not found." };
  if (friendship.friend_id !== userId && friendship.user_id !== userId) {
    return { error: "You cannot update this request." };
  }
  if (friendship.status !== "pending") {
    return { error: "This request is no longer pending." };
  }

  saveAll(friendships.filter((item) => item.id !== friendshipId));
  return {};
}

export function getFriendshipWith(
  userId: string,
  otherUserId: string
): Friendship | undefined {
  return findBetween(userId, otherUserId);
}

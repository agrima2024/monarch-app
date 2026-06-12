"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Friendship } from "@/lib/types";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getAcceptedFriendIds,
  getIncomingRequests,
  getOutgoingRequests,
  sendFriendRequest,
  sendFriendRequestToUser,
} from "@/lib/friendships";
import { getUserProfile } from "@/lib/user-registry";

interface FriendshipsContextValue {
  friendIds: string[];
  incoming: Friendship[];
  outgoing: Friendship[];
  refresh: () => void;
  requestFriend: (username: string) => Promise<string | null>;
  requestFriendById: (userId: string) => Promise<string | null>;
  acceptRequest: (friendshipId: string) => Promise<string | null>;
  declineRequest: (friendshipId: string) => Promise<string | null>;
}

const FriendshipsContext = createContext<FriendshipsContextValue | null>(null);

export function FriendshipsProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<Friendship[]>([]);
  const [outgoing, setOutgoing] = useState<Friendship[]>([]);

  const refresh = useCallback(() => {
    if (!userId) {
      setFriendIds([]);
      setIncoming([]);
      setOutgoing([]);
      return;
    }

    setFriendIds(getAcceptedFriendIds(userId));
    setIncoming(getIncomingRequests(userId));
    setOutgoing(getOutgoingRequests(userId));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const requestFriendById = useCallback(
    async (targetUserId: string) => {
      if (!userId) return "Sign in to add friends.";
      const result = sendFriendRequestToUser(userId, targetUserId);
      refresh();
      return "error" in result ? result.error : null;
    },
    [userId, refresh]
  );

  const requestFriend = useCallback(
    async (username: string) => {
      if (!userId) return "Sign in to add friends.";
      const result = sendFriendRequest(userId, username);
      refresh();
      return "error" in result ? result.error : null;
    },
    [userId, refresh]
  );

  const acceptRequest = useCallback(
    async (friendshipId: string) => {
      if (!userId) return "Sign in to accept requests.";
      const result = acceptFriendRequest(friendshipId, userId);
      refresh();
      return result.error ?? null;
    },
    [userId, refresh]
  );

  const declineRequest = useCallback(
    async (friendshipId: string) => {
      if (!userId) return "Sign in to decline requests.";
      const result = declineFriendRequest(friendshipId, userId);
      refresh();
      return result.error ?? null;
    },
    [userId, refresh]
  );

  const value = useMemo(
    () => ({
      friendIds,
      incoming,
      outgoing,
      refresh,
      requestFriend,
      requestFriendById,
      acceptRequest,
      declineRequest,
    }),
    [
      friendIds,
      incoming,
      outgoing,
      refresh,
      requestFriend,
      requestFriendById,
      acceptRequest,
      declineRequest,
    ]
  );

  return (
    <FriendshipsContext.Provider value={value}>
      {children}
    </FriendshipsContext.Provider>
  );
}

export function useFriendships(): FriendshipsContextValue {
  const context = useContext(FriendshipsContext);
  if (!context) {
    throw new Error("useFriendships must be used within FriendshipsProvider");
  }
  return context;
}

export function getFriendProfile(userId: string) {
  return getUserProfile(userId);
}

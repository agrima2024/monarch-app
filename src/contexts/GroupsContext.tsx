"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createGroup,
  FRIENDS_CIRCLE_ID,
  getGroupMemberIds,
  getGroupsForUser,
  getMessagesForGroup,
  postGroupMessage,
} from "@/lib/groups";
import type { CircleGroup, GroupMessage } from "@/lib/types";
import { useFriendships } from "./FriendshipsContext";

interface GroupsContextValue {
  groups: CircleGroup[];
  selectedGroupId: string;
  circleMemberIds: string[];
  messages: GroupMessage[];
  refresh: () => void;
  selectGroup: (groupId: string) => void;
  createCircleGroup: (name: string, memberIds: string[]) => string | null;
  sendMessage: (
    text: string,
    link?: { lat: number; lng: number; label: string }
  ) => void;
}

const GroupsContext = createContext<GroupsContextValue | null>(null);

export function GroupsProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  const { friendIds } = useFriendships();
  const [groups, setGroups] = useState<CircleGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(FRIENDS_CIRCLE_ID);
  const [messages, setMessages] = useState<GroupMessage[]>([]);

  const refresh = useCallback(() => {
    if (!userId) {
      setGroups([]);
      setMessages([]);
      return;
    }
    setGroups(getGroupsForUser(userId));
    setMessages(getMessagesForGroup(selectedGroupId));
  }, [userId, selectedGroupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const circleMemberIds = useMemo(() => {
    if (!userId) return [];
    return getGroupMemberIds(selectedGroupId, userId, friendIds);
  }, [selectedGroupId, userId, friendIds]);

  const selectGroup = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
    setMessages(getMessagesForGroup(groupId));
  }, []);

  const createCircleGroup = useCallback(
    (name: string, memberIds: string[]) => {
      if (!userId) return "Sign in to create a group.";
      if (name.trim().length < 2) return "Group name is too short.";
      const group = createGroup(name, memberIds, userId);
      refresh();
      setSelectedGroupId(group.id);
      return null;
    },
    [userId, refresh]
  );

  const sendMessage = useCallback(
    (
      text: string,
      link?: { lat: number; lng: number; label: string }
    ) => {
      if (!userId || !text.trim()) return;
      postGroupMessage(selectedGroupId, userId, text, link);
      setMessages(getMessagesForGroup(selectedGroupId));
    },
    [userId, selectedGroupId]
  );

  const value = useMemo(
    () => ({
      groups,
      selectedGroupId,
      circleMemberIds,
      messages,
      refresh,
      selectGroup,
      createCircleGroup,
      sendMessage,
    }),
    [
      groups,
      selectedGroupId,
      circleMemberIds,
      messages,
      refresh,
      selectGroup,
      createCircleGroup,
      sendMessage,
    ]
  );

  return (
    <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>
  );
}

export function useGroups(): GroupsContextValue {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error("useGroups must be used within GroupsProvider");
  }
  return context;
}

export { FRIENDS_CIRCLE_ID };

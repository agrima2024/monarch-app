import type { CircleGroup, GroupMessage } from "./types";

export const FRIENDS_CIRCLE_ID = "__friends_circle__";

const GROUPS_KEY = "monarch-circle-groups";
const MESSAGES_KEY = "monarch-group-messages";

function loadGroups(): CircleGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CircleGroup[];
  } catch {
    return [];
  }
}

function saveGroups(groups: CircleGroup[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

function loadMessages(): GroupMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GroupMessage[];
  } catch {
    return [];
  }
}

function saveMessages(messages: GroupMessage[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function getGroupsForUser(userId: string): CircleGroup[] {
  return loadGroups().filter(
    (group) =>
      group.created_by === userId || group.member_ids.includes(userId)
  );
}

export function getGroupMemberIds(
  groupId: string,
  userId: string,
  friendIds: string[]
): string[] {
  if (groupId === FRIENDS_CIRCLE_ID) {
    return [userId, ...friendIds];
  }

  const group = loadGroups().find((item) => item.id === groupId);
  if (!group) return [userId, ...friendIds];
  return Array.from(new Set([userId, ...group.member_ids]));
}

export function createGroup(
  name: string,
  memberIds: string[],
  createdBy: string
): CircleGroup {
  const group: CircleGroup = {
    id: `group-${crypto.randomUUID()}`,
    name: name.trim(),
    member_ids: Array.from(new Set(memberIds.filter((id) => id !== createdBy))),
    created_by: createdBy,
    created_at: new Date().toISOString(),
  };

  saveGroups([...loadGroups(), group]);
  return group;
}

export function getMessagesForGroup(groupId: string): GroupMessage[] {
  return loadMessages()
    .filter((message) => message.group_id === groupId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
}

export function postGroupMessage(
  groupId: string,
  userId: string,
  text: string,
  link?: { lat: number; lng: number; label: string }
): GroupMessage {
  const message: GroupMessage = {
    id: `msg-${crypto.randomUUID()}`,
    group_id: groupId,
    user_id: userId,
    text: text.trim(),
    created_at: new Date().toISOString(),
    ...(link && {
      link_lat: link.lat,
      link_lng: link.lng,
      link_label: link.label,
    }),
  };

  saveMessages([...loadMessages(), message]);
  return message;
}

export function getSeasonInfo(): { label: string; daysRemaining: number } {
  const seasonEnd = new Date("2026-08-31T00:00:00Z");
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((seasonEnd.getTime() - now.getTime()) / 86_400_000)
  );
  return { label: "Season II", daysRemaining };
}

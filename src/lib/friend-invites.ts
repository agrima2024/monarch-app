import { notifyDataChanged } from "./app-events";
import { sendFriendRequestToUser } from "./friendships";
import { findUserById } from "./user-registry";

const PENDING_INVITE_KEY = "monarch-pending-invite";

export interface PendingInvite {
  inviterId: string;
  inviterUsername: string;
}

export function buildInviteMessage(inviterUsername: string): string {
  return `@${inviterUsername} invited you to join Monarch! Sign up, accept this request, and start claiming territory together.`;
}

export function getAppBasePath(): string {
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/monarch-app")) {
      return "/monarch-app";
    }
  }
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export function buildInviteLink(userId: string, username: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://agrima2024.github.io";
  const basePath = getAppBasePath();
  const params = new URLSearchParams({
    invite: userId,
    from: username.replace(/^@/, ""),
  });
  return `${origin}${basePath}/login/?${params.toString()}`;
}

export function buildInviteShareText(
  inviterUsername: string,
  link: string
): string {
  return `${buildInviteMessage(inviterUsername)}\n\n${link}`;
}

export function savePendingInvite(invite: PendingInvite): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_INVITE_KEY, JSON.stringify(invite));
}

export function loadPendingInvite(): PendingInvite | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_INVITE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingInvite;
  } catch {
    return null;
  }
}

export function clearPendingInvite(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_INVITE_KEY);
}

export function parseInviteFromSearchParams(
  params: URLSearchParams
): PendingInvite | null {
  const inviterId = params.get("invite")?.trim();
  const inviterUsername = params.get("from")?.trim().replace(/^@/, "");

  if (!inviterId) return null;

  return {
    inviterId,
    inviterUsername: inviterUsername || "explorer",
  };
}

export function applyPendingInviteFriendRequest(newUserId: string): {
  applied: boolean;
  message?: string;
} {
  const pending = loadPendingInvite();
  if (!pending) return { applied: false };

  if (pending.inviterId === newUserId) {
    clearPendingInvite();
    return { applied: false };
  }

  const inviter = findUserById(pending.inviterId);
  const inviterUsername = inviter?.username ?? pending.inviterUsername;
  const inviteMessage = buildInviteMessage(inviterUsername);

  const result = sendFriendRequestToUser(
    pending.inviterId,
    newUserId,
    inviteMessage
  );

  clearPendingInvite();

  if ("error" in result) {
    return { applied: false, message: result.error };
  }

  notifyDataChanged();
  return { applied: true };
}

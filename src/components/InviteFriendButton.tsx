"use client";

import { Check, Link2, Share2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildInviteLink,
  buildInviteShareText,
} from "@/lib/friend-invites";

interface InviteFriendButtonProps {
  userId: string;
  username: string;
}

export function InviteFriendButton({
  userId,
  username,
}: InviteFriendButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteLink = useMemo(
    () => buildInviteLink(userId, username),
    [userId, username]
  );

  const shareInvite = async () => {
    setError(null);
    const shareText = buildInviteShareText(username, inviteLink);

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Join me on Monarch",
          text: `@${username} invited you to join Monarch and claim territory together.`,
          url: inviteLink,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (shareError) {
      if (
        shareError instanceof DOMException &&
        shareError.name === "AbortError"
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } catch {
        setError("Could not share the invite link. Try copying manually.");
      }
    }
  };

  return (
    <section className="rounded-2xl border border-gold/20 bg-surface-elevated p-5 space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-gold" />
        Invite a friend
      </h3>
      <p className="text-sm text-muted leading-relaxed">
        Share your invite link. When they sign up, they&apos;ll automatically
        get a friend request from you with a welcome message.
      </p>

      <button
        type="button"
        onClick={shareInvite}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-background font-semibold shadow-[0_0_15px_rgba(251,191,36,0.35)] hover:brightness-110 transition-all"
      >
        {copied ? (
          <>
            <Check className="h-5 w-5" />
            Invite link copied
          </>
        ) : (
          <>
            <Share2 className="h-5 w-5" />
            Share invite link
          </>
        )}
      </button>

      <div className="rounded-xl bg-surface border border-gold/10 px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-widest text-muted mb-1 flex items-center gap-1">
          <Link2 className="h-3 w-3" />
          Your invite link
        </p>
        <p className="text-xs text-foreground/80 break-all font-mono">
          {inviteLink}
        </p>
      </div>

      {error && <p className="text-xs text-red-300">{error}</p>}
    </section>
  );
}

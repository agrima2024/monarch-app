"use client";

import { useAuth } from "@/contexts/AuthContext";
import { FriendshipsProvider } from "@/contexts/FriendshipsContext";
import { GroupsProvider } from "@/contexts/GroupsContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <FriendshipsProvider userId={user?.id ?? null}>
      <GroupsProvider userId={user?.id ?? null}>{children}</GroupsProvider>
    </FriendshipsProvider>
  );
}

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { FriendshipsProvider } from "@/contexts/FriendshipsContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <FriendshipsProvider userId={user?.id ?? null}>
      {children}
    </FriendshipsProvider>
  );
}

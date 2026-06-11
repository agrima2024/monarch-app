"use client";

import { Crown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-dvh items-center justify-center bg-background">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-lg shadow-gold/20 mb-4">
          <Crown className="h-7 w-7 text-background crown-pulse" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-gold mb-2" />
        <p className="text-sm text-muted">Opening your kingdom…</p>
      </div>
    );
  }

  if (!user) return null;

  return children;
}

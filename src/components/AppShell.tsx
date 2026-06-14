"use client";

import { useCallback, useState } from "react";
import { AccountView } from "@/components/AccountView";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav, type AppTab } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { MapView } from "@/components/MapViewLoader";
import { useFriendships } from "@/contexts/FriendshipsContext";

export function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>("map");
  const [focusClaimId, setFocusClaimId] = useState<string | null>(null);
  const { incoming } = useFriendships();

  const handleViewTerritoryOnMap = useCallback((claimId: string) => {
    setFocusClaimId(claimId);
    setActiveTab("map");
  }, []);

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header />
      <main className="flex-1 min-h-0 relative">
        {activeTab === "map" ? (
          <MapView
            focusClaimId={focusClaimId}
            onFocusClaimHandled={() => setFocusClaimId(null)}
            hasBottomNav
          />
        ) : (
          <AccountView onViewTerritoryOnMap={handleViewTerritoryOnMap} />
        )}
      </main>
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingRequests={incoming.length}
      />
    </div>
  );
}

export function AuthenticatedApp() {
  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  );
}

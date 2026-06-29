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
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);
  const { incoming } = useFriendships();

  const handleViewTerritoryOnMap = useCallback((claimId: string) => {
    setFocusClaimId(claimId);
    setActiveTab("map");
  }, []);

  const handleOpenProfile = useCallback((userId: string) => {
    setOpenProfileId(userId);
    setActiveTab("map");
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {activeTab === "map" && (
        <MapView
          focusClaimId={focusClaimId}
          onFocusClaimHandled={() => setFocusClaimId(null)}
          openProfileId={openProfileId}
          onOpenProfileHandled={() => setOpenProfileId(null)}
          hasBottomNav
        />
      )}

      {activeTab === "account" && (
        <div className="absolute inset-0 overflow-y-auto pb-24 pt-[60px]">
          <AccountView
            onViewTerritoryOnMap={handleViewTerritoryOnMap}
            onOpenProfile={handleOpenProfile}
          />
        </div>
      )}

      <Header floating />

      <div className="absolute bottom-0 left-0 right-0 z-[7000] pointer-events-none">
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingRequests={incoming.length}
        />
      </div>
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

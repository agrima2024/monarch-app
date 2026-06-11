"use client";

import dynamic from "next/dynamic";

export const MapView = dynamic(
  () => import("./MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-3 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-sm text-muted">Loading map…</p>
        </div>
      </div>
    ),
  }
);

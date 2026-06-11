import { AuthGate } from "@/components/AuthGate";
import { Header } from "@/components/Header";
import { MapView } from "@/components/MapViewLoader";

export default function Home() {
  return (
    <AuthGate>
      <div className="flex flex-col h-dvh overflow-hidden">
        <Header />
        <main className="flex-1 min-h-0 relative">
          <MapView />
        </main>
      </div>
    </AuthGate>
  );
}

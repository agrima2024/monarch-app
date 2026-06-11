const DEMO_SESSION_KEY = "monarch-demo-session";

export interface AppUser {
  id: string;
  username: string;
  email?: string;
  mode: "demo" | "supabase";
}

export function loadDemoSession(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

export function saveDemoSession(user: AppUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_SESSION_KEY);
}

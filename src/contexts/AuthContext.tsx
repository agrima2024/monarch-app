"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isSupabaseConfigured } from "@/lib/auth/config";
import {
  clearDemoSession,
  loadDemoSession,
  saveDemoSession,
  type AppUser,
} from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isSupabaseMode: boolean;
  signInDemo: (username: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER_ID = "current-user";

function usernameFromEmail(email: string): string {
  return email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "_") || "explorer";
}

function mapSupabaseUser(
  id: string,
  email: string | undefined,
  metadata: Record<string, unknown> | undefined
): AppUser {
  const username =
    (typeof metadata?.username === "string" && metadata.username) ||
    (email ? usernameFromEmail(email) : "explorer");

  return {
    id,
    username,
    email,
    mode: "supabase",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseMode = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      if (isSupabaseMode) {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;

        if (!cancelled && sessionUser) {
          setUser(
            mapSupabaseUser(
              sessionUser.id,
              sessionUser.email,
              sessionUser.user_metadata
            )
          );
        }
      } else {
        const demoSession = loadDemoSession();
        if (!cancelled && demoSession) {
          setUser(demoSession);
        }
      }

      if (!cancelled) setIsLoading(false);
    }

    initAuth();

    if (!isSupabaseMode) {
      return () => {
        cancelled = true;
      };
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(
          mapSupabaseUser(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          )
        );
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isSupabaseMode]);

  const signInDemo = useCallback(async (username: string) => {
    const trimmed = username.trim().replace(/^@/, "");
    if (trimmed.length < 2) {
      throw new Error("Choose a username with at least 2 characters.");
    }

    const demoUser: AppUser = {
      id: DEMO_USER_ID,
      username: trimmed,
      mode: "demo",
    };

    saveDemoSession(demoUser);
    setUser(demoUser);
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseMode) {
        return "Supabase is not configured. Use demo login instead.";
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      return error?.message ?? null;
    },
    [isSupabaseMode]
  );

  const signUp = useCallback(
    async (email: string, password: string, username: string) => {
      if (!isSupabaseMode) {
        return "Supabase is not configured. Use demo login instead.";
      }

      const trimmedUsername = username.trim().replace(/^@/, "");
      if (trimmedUsername.length < 2) {
        return "Choose a username with at least 2 characters.";
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { username: trimmedUsername },
        },
      });

      return error?.message ?? null;
    },
    [isSupabaseMode]
  );

  const signOut = useCallback(async () => {
    clearDemoSession();

    if (isSupabaseMode) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    setUser(null);
  }, [isSupabaseMode]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isSupabaseMode,
      signInDemo,
      signInWithPassword,
      signUp,
      signOut,
    }),
    [
      user,
      isLoading,
      isSupabaseMode,
      signInDemo,
      signInWithPassword,
      signUp,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

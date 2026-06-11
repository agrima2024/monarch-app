"use client";

import { Crown, Loader2, LogIn, Shield, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "signin" | "signup" | "demo";

export function LoginForm() {
  const { isSupabaseMode, signInDemo, signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>(isSupabaseMode ? "signin" : "demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      if (mode === "demo") {
        await signInDemo(username);
        return;
      }

      if (mode === "signin") {
        const message = await signInWithPassword(email, password);
        if (message) setError(message);
        return;
      }

      const message = await signUp(email, password, username);
      if (message) {
        setError(message);
      } else {
        setInfo("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-2xl shadow-gold/30 mb-4">
            <Crown className="h-8 w-8 text-background crown-pulse" />
          </div>
          <h1 className="text-3xl font-bold shimmer-text">Monarch</h1>
          <p className="text-sm text-muted mt-2">
            Sign in to explore, claim territory, and crown yourself.
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-surface-elevated shadow-2xl overflow-hidden">
          {isSupabaseMode && (
            <div className="flex border-b border-gold/10">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setInfo(null);
                }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mode === "signin"
                    ? "bg-gold/10 text-gold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setInfo(null);
                }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mode === "signup"
                    ? "bg-gold/10 text-gold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Sign up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {(mode === "signup" || mode === "demo") && (
              <div>
                <label
                  htmlFor="username"
                  className="text-sm text-muted mb-2 block"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl bg-surface border border-gold/10 px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:border-gold/40"
                />
              </div>
            )}

            {mode !== "demo" && (
              <>
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm text-muted mb-2 block"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl bg-surface border border-gold/10 px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:border-gold/40"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm text-muted mb-2 block"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    required
                    minLength={6}
                    className="w-full rounded-xl bg-surface border border-gold/10 px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:border-gold/40"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-950/40 border border-red-500/30">
                <Shield className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {info && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-sm text-emerald-200">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-background font-semibold shadow-lg shadow-gold/20 hover:shadow-gold/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entering the kingdom…
                </>
              ) : mode === "signup" ? (
                <>
                  <UserPlus className="h-5 w-5" />
                  Create account
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  {mode === "demo" ? "Enter as explorer" : "Sign in"}
                </>
              )}
            </button>
          </form>

          {!isSupabaseMode && (
            <div className="px-6 pb-6">
              <p className="text-xs text-muted text-center leading-relaxed">
                Demo mode — no backend required. Your session is saved on this
                device. Connect Supabase for real accounts.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          By entering, you agree to explore respectfully and claim only places
          you&apos;ve visited.
        </p>
      </div>
    </div>
  );
}

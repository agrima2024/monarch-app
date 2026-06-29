"use client";

import { Loader2, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMonarchColor } from "@/lib/monarch-colors";
import { searchProfiles } from "@/lib/profile-search";
import { getUsernameInitial } from "@/lib/user-registry";
import type { Profile } from "@/lib/types";

interface UsernameSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectUser: (profile: Profile) => void;
  currentUserId: string;
  placeholder?: string;
  disabled?: boolean;
}

export function UsernameSearchInput({
  value,
  onChange,
  onSelectUser,
  currentUserId,
  placeholder = "Search by username",
  disabled,
}: UsernameSearchInputProps) {
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = window.setTimeout(async () => {
      const results = await searchProfiles(query, currentUserId);
      if (cancelled) return;
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setIsSearching(false);
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, currentUserId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isOpen && (suggestions.length > 0 || isSearching);

  const emptyMessage = useMemo(() => {
    if (value.trim().length < 1) return null;
    if (isSearching) return null;
    return "No explorers found with that username.";
  }, [value, isSearching]);

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="w-full rounded-xl bg-surface border border-gold/10 px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:border-gold/40"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[8000] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl">
          {isSearching && suggestions.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching explorers…
            </div>
          ) : (
            suggestions.map((profile) => {
              const color = getMonarchColor(profile.id);
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => {
                    onSelectUser(profile);
                    onChange(profile.username);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-900 transition-colors"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-background border-2"
                    style={{
                      background: color.fill,
                      borderColor: color.stroke,
                    }}
                  >
                    {getUsernameInitial(profile.username)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">@{profile.username}</p>
                    <p className="text-[11px] text-muted flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Tap to add friend
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {!showDropdown && emptyMessage && value.trim().length > 0 && (
        <p className="absolute left-0 right-0 top-[calc(100%+0.35rem)] rounded-xl border border-zinc-800 bg-zinc-950/95 px-4 py-3 text-sm text-muted shadow-xl">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

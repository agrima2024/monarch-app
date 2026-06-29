import { searchRemoteProfiles } from "./supabase-data";
import { isSupabaseConfigured } from "./auth/config";
import type { Profile } from "./types";
import { findUserByUsername, searchLocalUsersByPrefix } from "./user-registry";

function normalizeQuery(query: string): string {
  return query.trim().replace(/^@/, "").toLowerCase();
}

function searchLocalProfiles(
  query: string,
  excludeUserId?: string
): Profile[] {
  const normalized = normalizeQuery(query);
  if (normalized.length < 1) return [];

  return searchLocalUsersByPrefix(query, excludeUserId);
}

export async function searchProfiles(
  query: string,
  excludeUserId?: string
): Promise<Profile[]> {
  const normalized = normalizeQuery(query);
  if (normalized.length < 1) return [];

  if (isSupabaseConfigured()) {
    const remote = await searchRemoteProfiles(query, excludeUserId);
    if (remote.length > 0) return remote;
  }

  return searchLocalProfiles(query, excludeUserId);
}

export async function resolveProfileFromQuery(
  query: string,
  excludeUserId?: string
): Promise<Profile | null> {
  const exactLocal = findUserByUsername(query);
  if (exactLocal && exactLocal.id !== excludeUserId) {
    return {
      id: exactLocal.id,
      username: exactLocal.username,
      avatar_url: null,
      created_at: exactLocal.created_at,
    };
  }

  const matches = await searchProfiles(query, excludeUserId);
  const normalized = normalizeQuery(query);
  return (
    matches.find((profile) => profile.username.toLowerCase() === normalized) ??
    matches[0] ??
    null
  );
}

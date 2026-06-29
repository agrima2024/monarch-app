import type { Profile } from "./types";

const cache = new Map<string, Profile>();

export function setCachedProfiles(profiles: Profile[]): void {
  cache.clear();
  for (const profile of profiles) {
    cache.set(profile.id, profile);
  }
}

export function mergeCachedProfiles(profiles: Profile[]): void {
  for (const profile of profiles) {
    cache.set(profile.id, profile);
  }
}

export function getCachedProfile(userId: string): Profile | undefined {
  return cache.get(userId);
}

export function cacheProfile(profile: Profile): void {
  cache.set(profile.id, profile);
}

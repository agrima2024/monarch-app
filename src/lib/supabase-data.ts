import { isSupabaseConfigured } from "./auth/config";
import { createClient } from "./supabase/client";
import { mergeCachedProfiles, setCachedProfiles } from "./profile-cache";
import type { Claim, Location, Profile } from "./types";

function mapClaimRow(row: Record<string, unknown>): Claim {
  return {
    id: String(row.id),
    location_id: String(row.location_id),
    user_id: String(row.user_id),
    place_name: String(row.place_name),
    photo_url: String(row.photo_url),
    review_text: String(row.review_text),
    created_at: String(row.created_at),
    net_score: Number(row.net_score ?? 0),
    disgraced_at: row.disgraced_at ? String(row.disgraced_at) : null,
  };
}

function mapProfileRow(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    username: String(row.username),
    avatar_url: (row.avatar_url as string | null) ?? null,
    created_at: String(row.created_at),
  };
}

export async function fetchRemoteClaims(): Promise<Claim[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("claims").select("*");

  if (error || !data) {
    console.warn("Failed to load remote claims:", error?.message);
    return [];
  }

  return data.map((row) => mapClaimRow(row as Record<string, unknown>));
}

export async function fetchRemoteLocations(): Promise<Location[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("locations").select("*");

  if (error || !data) {
    console.warn("Failed to load remote locations:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: String(row.id),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  }));
}

export async function fetchRemoteProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, created_at");

  if (error || !data) {
    console.warn("Failed to load remote profiles:", error?.message);
    return [];
  }

  const profiles = data.map((row) =>
    mapProfileRow(row as Record<string, unknown>)
  );
  setCachedProfiles(profiles);
  return profiles;
}

export async function searchRemoteProfiles(
  query: string,
  excludeUserId?: string
): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return [];

  const trimmed = query.trim().replace(/^@/, "");
  if (trimmed.length < 1) return [];

  const supabase = createClient();
  let request = supabase
    .from("profiles")
    .select("id, username, avatar_url, created_at")
    .ilike("username", `%${trimmed}%`)
    .limit(8);

  if (excludeUserId) {
    request = request.neq("id", excludeUserId);
  }

  const { data, error } = await request;
  if (error || !data) return [];

  const profiles = data.map((row) =>
    mapProfileRow(row as Record<string, unknown>)
  );
  mergeCachedProfiles(profiles);
  return profiles;
}

export async function syncLocationToRemote(location: Location): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  const { error } = await supabase.from("locations").upsert({
    id: location.id,
    latitude: location.latitude,
    longitude: location.longitude,
  });

  if (error) {
    console.warn("Failed to sync location:", error.message);
  }
}

export async function syncClaimToRemote(claim: Claim): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  const { error } = await supabase.from("claims").upsert({
    id: claim.id,
    location_id: claim.location_id,
    user_id: claim.user_id,
    place_name: claim.place_name,
    photo_url: claim.photo_url,
    review_text: claim.review_text,
    created_at: claim.created_at,
    net_score: claim.net_score,
    disgraced_at: claim.disgraced_at,
  });

  if (error) {
    console.warn("Failed to sync claim:", error.message);
  }
}

export async function removeRemoteClaim(claimId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  const { error } = await supabase.from("claims").delete().eq("id", claimId);
  if (error) {
    console.warn("Failed to delete remote claim:", error.message);
  }
}

export async function removeRemoteLocation(locationId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("locations")
    .delete()
    .eq("id", locationId);
  if (error) {
    console.warn("Failed to delete remote location:", error.message);
  }
}

export async function refreshCloudData(): Promise<{
  claims: Claim[];
  locations: Location[];
  profiles: Profile[];
}> {
  const [claims, locations, profiles] = await Promise.all([
    fetchRemoteClaims(),
    fetchRemoteLocations(),
    fetchRemoteProfiles(),
  ]);

  return { claims, locations, profiles };
}

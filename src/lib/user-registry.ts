import type { Profile } from "./types";

const REGISTRY_KEY = "monarch-user-registry";

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

function loadRegistry(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredUser[];
    return parsed.map((user) => ({
      ...user,
      email: user.email ?? "",
    }));
  } catch {
    return [];
  }
}

function saveRegistry(users: StoredUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(users));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string): string {
  return username.trim().replace(/^@/, "").toLowerCase();
}

function displayUsername(username: string): string {
  return username.trim().replace(/^@/, "");
}

export function findUserById(id: string): StoredUser | undefined {
  return loadRegistry().find((user) => user.id === id);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = normalizeEmail(email);
  return loadRegistry().find(
    (user) => user.email && normalizeEmail(user.email) === normalized
  );
}

export function findUserByUsername(username: string): StoredUser | undefined {
  const normalized = normalizeUsername(username);
  return loadRegistry().find(
    (user) => normalizeUsername(user.username) === normalized
  );
}

export function listRegisteredUsers(): StoredUser[] {
  return loadRegistry();
}

export function registerLocalUser(
  email: string,
  username: string,
  password: string
): { user: StoredUser } | { error: string } {
  const normalizedEmail = normalizeEmail(email);
  const display = displayUsername(username);

  if (!normalizedEmail.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  if (display.length < 2) {
    return { error: "Choose a username with at least 2 characters." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const users = loadRegistry();
  if (users.some((user) => user.email && normalizeEmail(user.email) === normalizedEmail)) {
    return { error: "An account with this email already exists on this device." };
  }

  if (users.some((user) => normalizeUsername(user.username) === normalizeUsername(username))) {
    return { error: "That username is already taken on this device." };
  }

  const user: StoredUser = {
    id: `user-${crypto.randomUUID()}`,
    email: normalizedEmail,
    username: display,
    password,
    created_at: new Date().toISOString(),
  };

  saveRegistry([...users, user]);
  return { user };
}

export function authenticateLocalUser(
  email: string,
  password: string
): StoredUser | null {
  const normalized = normalizeEmail(email);
  const user =
    findUserByEmail(normalized) ??
    loadRegistry().find(
      (entry) =>
        !entry.email &&
        normalizeUsername(entry.username) === normalizeUsername(email)
    );

  if (!user || user.password !== password) return null;
  return user;
}

export function getUserProfile(userId: string): Profile | undefined {
  const user = findUserById(userId);
  if (!user) return undefined;

  return {
    id: user.id,
    username: user.username,
    avatar_url: null,
    created_at: user.created_at,
  };
}

export function getUsernameInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

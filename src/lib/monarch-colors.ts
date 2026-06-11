export const MONARCH_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  "user-1": { fill: "#d4a853", stroke: "#f0d78c", label: "alex_explorer" },
  "user-2": { fill: "#059669", stroke: "#34d399", label: "sam_wanderer" },
  "user-3": { fill: "#7c3aed", stroke: "#a78bfa", label: "jordan_trails" },
  "current-user": { fill: "#3b82f6", stroke: "#93c5fd", label: "you" },
};

export function getMonarchColor(userId: string) {
  if (MONARCH_COLORS[userId]) return MONARCH_COLORS[userId];

  // Deterministic fallback for unknown users
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    fill: `hsl(${hue}, 65%, 50%)`,
    stroke: `hsl(${hue}, 80%, 70%)`,
    label: userId,
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

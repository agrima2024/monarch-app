export function getExplorerTitle(totalScore: number): string {
  if (totalScore >= 600) return "Legendary Monarch";
  if (totalScore >= 300) return "Crown Seeker";
  if (totalScore >= 100) return "Pathfinder";
  if (totalScore >= 30) return "Trail Scout";
  return "Wanderer";
}

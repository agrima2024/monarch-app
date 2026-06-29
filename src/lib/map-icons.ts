import L from "leaflet";

export function createPersonIcon(
  color: string,
  stroke: string,
  initial: string,
  size = 32
): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div class="gold-glow-marker" style="display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid ${stroke};font-size:${size * 0.4}px;font-weight:700;color:#0c0a09;">${initial}</div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createCrownIcon(
  fill: string,
  stroke: string,
  size = 44
): L.DivIcon {
  const iconSize = Math.round(size * 0.55);
  return L.divIcon({
    className: "",
    html: `<div class="gold-glow-marker crown-pulse" style="display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <div style="background:${fill};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid ${stroke};color:#0c0a09;box-shadow:0 0 20px ${stroke}88;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.019a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
      </div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createAvatarClusterIcon(
  primaryColor: string,
  primaryStroke: string,
  primaryInitial: string,
  satellites: { color: string; stroke: string; initial: string }[]
): L.DivIcon {
  const size = 40;
  const satelliteHtml = satellites
    .slice(0, 2)
    .map(
      (sat, index) =>
        `<div style="position:absolute;top:${index === 0 ? -4 : 8}px;left:${index === 0 ? 24 : -6}px;background:${sat.color};width:18px;height:18px;border-radius:50%;border:2px solid ${sat.stroke};display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#0c0a09;">${sat.initial}</div>`
    )
    .join("");

  return L.divIcon({
    className: "",
    html: `<div class="gold-glow-marker" style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
      ${satelliteHtml}
      <div style="position:relative;background:${primaryColor};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid ${primaryStroke};font-size:16px;font-weight:700;color:#0c0a09;box-shadow:0 0 15px rgba(251,191,36,0.35);">${primaryInitial}</div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export const MOCK_KINGDOMS = [
  {
    id: "mock-golden-gate",
    name: "Golden Gate Park",
    latitude: 37.7694,
    longitude: -122.4862,
    fill: "#d4a853",
    stroke: "#f0d78c",
  },
  {
    id: "mock-ferry-building",
    name: "Ferry Building",
    latitude: 37.7955,
    longitude: -122.3937,
    fill: "#059669",
    stroke: "#34d399",
  },
  {
    id: "mock-dolores",
    name: "Dolores Park",
    latitude: 37.7596,
    longitude: -122.4269,
    fill: "#7c3aed",
    stroke: "#a78bfa",
  },
  {
    id: "mock-coit",
    name: "Coit Tower",
    latitude: 37.8024,
    longitude: -122.4058,
    fill: "#e11d48",
    stroke: "#fb7185",
  },
  {
    id: "mock-oracle-park",
    name: "Oracle Park",
    latitude: 37.7786,
    longitude: -122.3893,
    fill: "#0891b2",
    stroke: "#22d3ee",
  },
] as const;

export const DATA_CHANGED_EVENT = "monarch-data-changed";

export function notifyDataChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
}

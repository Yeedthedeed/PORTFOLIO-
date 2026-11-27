import { useEffect, useState } from "react";

/**
 * DEVICE LAYOUT
 *
 * One source of truth for the device class used by the responsive layouts.
 * The classification is written to `<html data-layout>` so CSS, diagnostics
 * and the menu switcher all agree on the active presentation.
 *
 *   phone   — up to 767px, or a coarse pointer up to 600px
 *   tablet  — 768–1180px, or any coarse pointer between 601 and 1400px
 *   desktop — everything else
 *
 * Real devices always receive their own layout automatically. A manual
 * override is available from the site menu for previewing.
 */
export type LayoutMode = "phone" | "tablet" | "desktop";
export type LayoutPreference = LayoutMode | "auto";

const STORAGE_KEY = "iv-layout-preference";
const EVENT = "iv:layout-preference";

export function detectLayout(): LayoutMode {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  const height = window.innerHeight;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  /* A phone turned sideways is still a phone. */
  const shortSide = Math.min(width, height);
  if (shortSide < 600 && coarse) return "phone";
  if (width < 768) return "phone";

  if (coarse) {
    if (width <= 1400) return "tablet";
    return "desktop";
  }
  if (width <= 1180) return "tablet";
  return "desktop";
}

export function readLayoutPreference(): LayoutPreference {
  if (typeof window === "undefined") return "auto";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "phone" || stored === "tablet" || stored === "desktop"
    ? stored
    : "auto";
}

export function setLayoutPreference(preference: LayoutPreference) {
  if (typeof window === "undefined") return;
  if (preference === "auto") window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, preference);
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useDeviceLayout() {
  const [preference, setPreference] = useState<LayoutPreference>(() =>
    readLayoutPreference()
  );
  const [detected, setDetected] = useState<LayoutMode>(() => detectLayout());

  useEffect(() => {
    const update = () => setDetected(detectLayout());
    update();
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  useEffect(() => {
    const sync = () => setPreference(readLayoutPreference());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const layout: LayoutMode =
    preference === "auto" ? detected : preference;

  useEffect(() => {
    document.documentElement.dataset.layout = layout;
    document.documentElement.dataset.pointer = window.matchMedia(
      "(pointer: coarse)"
    ).matches
      ? "coarse"
      : "fine";
  }, [layout]);

  return {
    layout,
    detected,
    preference,
    setPreference: setLayoutPreference,
  };
}

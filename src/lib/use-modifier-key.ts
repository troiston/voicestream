"use client";
import { useSyncExternalStore } from "react";

export function useModifierKey(): "⌘" | "Ctrl" {
  return useSyncExternalStore(
    () => () => {},
    () =>
      typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
        ? "⌘"
        : "Ctrl",
    () => "Ctrl",
  );
}

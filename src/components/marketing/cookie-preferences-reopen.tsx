"use client";

import { Button } from "@/components/ui/button";
import {
  COOKIE_PREFERENCES_CHANGED,
  COOKIE_PREFERENCES_STORAGE_KEY,
} from "@/lib/cookie-consent-key";

export function CookiePreferencesReopen() {
  return (
    <Button
      type="button"
      className="min-h-11"
      variant="primary"
      onClick={() => {
        if (typeof window === "undefined") {
          return;
        }
        window.localStorage.removeItem(COOKIE_PREFERENCES_STORAGE_KEY);
        window.dispatchEvent(new Event(COOKIE_PREFERENCES_CHANGED));
      }}
    >
      Reabrir o banner de preferências
    </Button>
  );
}

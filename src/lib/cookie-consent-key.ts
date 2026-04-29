/** `localStorage` key partilhada com `CookieConsentBanner` e a página `/cookies`. */
export const COOKIE_PREFERENCES_STORAGE_KEY = "cv-cookie-preferences" as const;

/** Disparado após `setItem`/`removeItem` na mesma aba para `useSyncExternalStore` reagir. */
export const COOKIE_PREFERENCES_CHANGED = "cv-cookie-preferences-changed" as const;

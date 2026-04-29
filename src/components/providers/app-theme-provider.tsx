"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

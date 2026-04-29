/**
 * IDs estáveis para âncoras do índice (TOC) alinhadas com headings MDX.
 */
export function idFromTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/\W+/g, "-")
    .replace(/^-|-$/g, "");
}

export type TocEntry = { t: string; id: string };

export function tocFromBody(s: string): TocEntry[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("## ") && !l.startsWith("###"))
    .map((l) => l.replace(/^##\s+/, ""))
    .map((t) => ({ t, id: idFromTitle(t) }));
}

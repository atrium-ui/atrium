import basicsThemeCss from "../../../packages/kits/src/basics/theme.css?raw";
import workbenchThemeCss from "../../../packages/kits/src/workbench/theme.css?raw";

const themeCssByKit: Record<string, string> = {
  basics: basicsThemeCss,
  workbench: workbenchThemeCss,
};

/** Page background from a kit's theme.css (`--color-background`), or white. */
export function kitBackgroundColor(kit = "basics"): string {
  const themeCss = themeCssByKit[kit] ?? basicsThemeCss;
  return themeCss.match(/--color-background:\s*([^;]+);/)?.[1]?.trim() ?? "#fff";
}

/** True when a hex color is dark enough that light chrome text/borders fit better. */
export function isDarkColor(color: string): boolean {
  const hex = color.trim().replace(/^#/, "");
  if (hex.length !== 6) return false;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

/**
 * Builds the isolated preview document shown in kit iframes.
 * Kit snippets rely on Tailwind utilities + kit theme tokens, which the
 * Tailwind browser build compiles at runtime inside the frame. This matches
 * the standalone pages shipped in the zip and avoids leaking kit styles
 * into the docs.
 *
 * NOTE: returned string must NOT be pre-escaped — Astro escapes attribute
 * values itself. Manual escaping gets double-escaped and breaks URLs.
 */
export function kitPreviewDocument(
  bodyHtml: string,
  elementsUrl: string,
  kit = "basics",
): string {
  const themeCss = themeCssByKit[kit] ?? basicsThemeCss;
  // Split theme.css: `@import "tailwindcss"` can't be inlined, and `@theme`
  // tokens must go into a `text/tailwindcss` block for the browser build.
  // (`@theme` may carry flags like `static` — match up to the opening brace.)
  const themeMatch = themeCss.match(/@theme[^{]*\{[\s\S]*?\n\}/);
  const themeTokens = themeMatch ? themeMatch[0] : "";
  const themePlainCss = themeCss
    .replace(/@import[^;]+;/, "")
    .replace(/@theme[^{]*\{[\s\S]*?\n\}/, "")
    .trim();

  // Body background comes from the kit itself, so each kit's previews match
  // its own shell.
  const background = kitBackgroundColor(kit);

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"><\/script><style type="text/tailwindcss">${themeTokens}</style><style>${themePlainCss}
/* Preview-only: a non-modal <dialog open> is position: absolute per UA
   stylesheet, which collapses its wrapper and positions against the
   viewport — clipped inside fixed-height carousel cards (overflow-hidden).
   Keep previews in-flow; real modals via showModal() (:modal) are untouched. */
dialog[open]:not(:modal){position:static}</style><script src="${elementsUrl}"><\/script></head><body style="margin:0;padding:1.5rem;font-family:ui-sans-serif,system-ui,sans-serif;background:${background};">${bodyHtml}</body></html>`;
}

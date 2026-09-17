import type { APIRoute } from "astro";
import { build } from "esbuild";
import { resolve } from "node:path";

// Prebuilt browser bundle of the kit preview dependency (`@atrium-ui/elements`).
// Served as a static asset so kit preview iframes run workspace code with no
// CDN imports. Icons need no bundle — kits inline their SVG sprite.
let cached: Promise<string> | undefined;

function bundle(): Promise<string> {
  // NOTE: resolved from the docs root (astro's cwd in dev and build),
  // not import.meta.url — the route executes compiled from dist/.
  const root = process.cwd();
  if (!cached) {
    cached = build({
      entryPoints: [resolve(root, "src/components/kit-preview-entry.ts")],
      bundle: true,
      // IIFE (not ESM): preview iframes are sandboxed without allow-same-origin,
      // so module scripts would fail CORS. A classic script has no such requirement.
      format: "iife",
      platform: "browser",
      minify: true,
      write: false,
      // Ignore docs/tsconfig.json (experimentalDecorators:true): it makes esbuild
      // emit standard decorators untransformed, which is invalid JS in the bundle.
      tsconfigRaw: '{"compilerOptions":{}}',
    }).then((result) => result.outputFiles?.[0]?.text ?? "");
  }
  return cached;
}

export const GET: APIRoute = async () => {
  const code = await bundle();
  return new Response(code, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      // Short-lived on purpose: the filename is stable while the bundle
      // changes with workspace code. Long-lived/immutable caching would
      // pin a stale (possibly broken) bundle in browsers across updates.
      "Cache-Control": "public, max-age=60, must-revalidate",
    },
  });
};

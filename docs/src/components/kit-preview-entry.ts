// Entry for the prebuilt kit-preview bundle served at /kit-preview/elements.js.
// Kit preview iframes (KitSection) load this instead of CDN imports so previews
// always run the workspace code. Pinned here, not per-snippet.
// Kits ship icons as inline <symbol> sprites referenced with <use>, so no icon
// runtime belongs in this bundle.
import "@atrium-ui/elements";
import "@atrium-ui/panels";

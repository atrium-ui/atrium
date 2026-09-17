# Basics UI Kit

Warm personal-wiki style: paper background, serif display type, clay-orange
primary with green accent.
Framework-agnostic: plain HTML + `@atrium-ui/elements` + Tailwind v4.

## Contents

See `kit.json` for the ordered section list. Every file in `sections/` is a
copy-paste snippet. `index.html` composes them into one generic workspace
dashboard — a greeting header, three tabbed views (Overview, Settings, Access)
and a shared help footer — copy it as a starter, or copy snippets
individually.

## Install (zip)

1. Download `basics.zip` from the docs kits page.
2. Unzip, e.g. into `src/ui-kit/` — keep `theme.css`, `sections/` and `icons/` together.
3. Install runtime deps:

   ```bash
   bun add @atrium-ui/elements
   ```

   Tailwind v4 is required for the utility classes.
4. Import the theme once in your Tailwind v4 stylesheet (e.g. `src/index.css`).
   Do not `<link>` it in HTML — `@theme` tokens only register when compiled:

   ```css
   @import "tailwindcss";
   @import "./ui-kit/theme.css";
   ```

   Then import the elements once (global layout / entry):

   ```html
   <script type="module">
     import "@atrium-ui/elements";
     // or import only what you use:
     // import "@atrium-ui/elements/tabs";
     // import "@atrium-ui/elements/toggle";
     // import "@atrium-ui/elements/range";
     // import "@atrium-ui/elements/color-picker";
     // import "@atrium-ui/elements/expandable";
     // import "@atrium-ui/elements/list";
     // import "@atrium-ui/elements/portal";
     // import "@atrium-ui/elements/blur";
     // import "@atrium-ui/elements/popover";
   </script>
   ```

   Icons need no runtime. Paste `icons/sprite.html` (all 22 symbols, built from
   `icons/*.svg`) once near the top of `<body>`, then reference any icon:

   ```html
   <svg class="h-4 w-4" aria-hidden="true"><use href="#kit-icon-search"></use></svg>
   ```

   Each snippet also inlines the few symbols it uses, so it works standalone.

5. Copy any snippet from `sections/*.html` into your pages.

No Tailwind build step in your project? Skip steps 3–4 and `<link>` the
`global.css` in this zip instead — a pre-compiled, minified stylesheet with
the base reset, this kit's utilities, and its theme tokens already baked in:

```html
<link rel="stylesheet" href="./ui-kit/global.css" />
```

Tip: preview `index.html` via a static server
(e.g. `bun x serve .`), not `file://` — the Tailwind browser build and the
element imports need http(s).

## Theming

Change brand color in one place: `theme.css` `@theme` tokens
(`--color-primary-*`, `--color-accent-*`). Sections reference only those tokens
via classes like `bg-primary-500` / `text-accent-600`.

## Element imports per section

Each section file starts with an HTML comment listing the element import it needs,
e.g. `<!-- requires: @atrium-ui/elements/tabs -->`. Import the full package or
just the ones you use.

type Palette = Record<string, string>;

const dark: Palette = {
  scheme: "dark",
  bg: "#111214",
  surface: "#17181b",
  "surface-raised": "#202126",
  border: "#2a2c33",
  "gutter-bg": "#111214",
  line: "rgba(255,255,255,.07)",
  "band-line": "rgba(255,255,255,.16)",
  "hour-line": "rgba(255,255,255,.035)",
  "noon-line": "rgba(255,255,255,.1)",
  text: "#e8e9ec",
  "text-dim": "#a0a3ab",
  "text-faint": "#62656e",
  accent: "#7c93ff",
  "accent-text": "#0d0f1a",
  now: "#ff8f57",
  weekend: "rgba(0,0,0,.22)",
  "today-bg": "rgba(124,147,255,.08)",
  "today-border": "rgba(124,147,255,.4)",
  "off-hours": "rgba(0,0,0,.26)",
  busy: "#ff5f6d",
  "busy-alpha": ".32",
  "event-alpha": ".3",
  "event-text": "#f1f2f4",
  stripe: "rgba(255,255,255,.14)",
  selection: "rgba(124,147,255,.16)",
  "heading-bg": "rgba(32,33,38,.92)",
  "strip-bg": "#15161a",
  "strip-view": "rgba(124,147,255,.22)",
  shadow: "0 12px 32px rgba(0,0,0,.5)",
};

const light: Palette = {
  scheme: "light",
  bg: "#ffffff",
  surface: "#f7f8fa",
  "surface-raised": "#ffffff",
  border: "#e2e4e9",
  "gutter-bg": "#fbfbfc",
  line: "rgba(0,0,0,.08)",
  "band-line": "rgba(0,0,0,.18)",
  "hour-line": "rgba(0,0,0,.045)",
  "noon-line": "rgba(0,0,0,.12)",
  text: "#1d1f24",
  "text-dim": "#5d6270",
  "text-faint": "#9aa0ab",
  accent: "#3b5bfd",
  "accent-text": "#ffffff",
  now: "#f0602a",
  weekend: "rgba(0,0,0,.028)",
  "today-bg": "rgba(59,91,253,.06)",
  "today-border": "rgba(59,91,253,.35)",
  "off-hours": "rgba(0,0,0,.04)",
  busy: "#ff3b4e",
  "busy-alpha": ".22",
  "event-alpha": ".2",
  "event-text": "#1d1f24",
  stripe: "rgba(255,255,255,.6)",
  selection: "rgba(59,91,253,.12)",
  "heading-bg": "rgba(255,255,255,.94)",
  "strip-bg": "#f3f4f6",
  "strip-view": "rgba(59,91,253,.18)",
  shadow: "0 12px 32px rgba(15,20,40,.18)",
};

const solarized: Palette = {
  scheme: "dark",
  bg: "#002b36",
  surface: "#073642",
  "surface-raised": "#0a3f4c",
  border: "#11505e",
  "gutter-bg": "#002b36",
  line: "rgba(147,161,161,.13)",
  "band-line": "rgba(147,161,161,.26)",
  "hour-line": "rgba(147,161,161,.06)",
  "noon-line": "rgba(147,161,161,.16)",
  text: "#eee8d5",
  "text-dim": "#93a1a1",
  "text-faint": "#657b83",
  accent: "#268bd2",
  "accent-text": "#fdf6e3",
  now: "#cb4b16",
  weekend: "rgba(0,0,0,.14)",
  "today-bg": "rgba(38,139,210,.12)",
  "today-border": "rgba(38,139,210,.5)",
  "off-hours": "rgba(0,0,0,.18)",
  busy: "#dc322f",
  "busy-alpha": ".32",
  "event-alpha": ".3",
  "event-text": "#eee8d5",
  stripe: "rgba(253,246,227,.14)",
  selection: "rgba(38,139,210,.18)",
  "heading-bg": "rgba(7,54,66,.94)",
  "strip-bg": "#01313d",
  "strip-view": "rgba(38,139,210,.28)",
  shadow: "0 12px 32px rgba(0,0,0,.45)",
};

const highContrast: Palette = {
  scheme: "dark",
  bg: "#000000",
  surface: "#000000",
  "surface-raised": "#0b0b0b",
  border: "#ffffff",
  "gutter-bg": "#000000",
  line: "rgba(255,255,255,.4)",
  "band-line": "#ffffff",
  "hour-line": "rgba(255,255,255,.22)",
  "noon-line": "rgba(255,255,255,.55)",
  text: "#ffffff",
  "text-dim": "#ffffff",
  "text-faint": "#d6d6d6",
  accent: "#ffd400",
  "accent-text": "#000000",
  now: "#ff4545",
  weekend: "rgba(255,255,255,.07)",
  "today-bg": "rgba(255,212,0,.14)",
  "today-border": "#ffd400",
  "off-hours": "rgba(120,120,120,.28)",
  busy: "#ff4545",
  "busy-alpha": ".45",
  "event-alpha": ".55",
  "event-text": "#ffffff",
  stripe: "rgba(0,0,0,.55)",
  selection: "rgba(255,212,0,.22)",
  "heading-bg": "#000000",
  "strip-bg": "#000000",
  "strip-view": "rgba(255,212,0,.35)",
  shadow: "0 0 0 2px #ffffff",
};

export const themes = { dark, light, solarized, "high-contrast": highContrast } as const;
export type ThemeName = keyof typeof themes | "auto";

const vars = (palette: Palette) =>
  Object.entries(palette)
    .map(([key, value]) => `--cal-${key}:${value};`)
    .join("");

const themeRules = [
  `:host{${vars(dark)}}`,
  ...Object.entries(themes).map(([name, palette]) => `:host([theme="${name}"]){${vars(palette)}}`),
  `:host([theme="auto"]){${vars(dark)}}`,
  `@media (prefers-color-scheme: light){:host([theme="auto"]){${vars(light)}}}`,
].join("\n");

export const styles = `
:host {
  --cal-font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --cal-radius: 8px;
  --cal-event-radius: 4px;
  --cal-gutter-width: 48px;
  --cal-strip-width: 12px;
  --cal-layer-off-hours: #8b8f9a;
  --cal-layer-busyness: var(--cal-busy);
  --cal-layer-events: var(--cal-accent);
}
${themeRules}

:host {
  display: block;
  position: relative;
  height: 100%;
  min-height: 360px;
  overflow: hidden;
  background: var(--cal-bg);
  color: var(--cal-text);
  color-scheme: var(--cal-scheme);
  font: 13px/1.4 var(--cal-font);
  -webkit-user-select: none;
  user-select: none;
}
:host([hide-toolbar]) [part~="toolbar"] { display: none; }
* { box-sizing: border-box; }
button, input, select, textarea { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--cal-accent); outline-offset: 1px; }

[part~="root"] { display: flex; height: 100%; }
[part~="main"] { flex: 1; min-width: 0; display: flex; flex-direction: column; }

[part~="toolbar"] {
  container-type: inline-size;
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  background: var(--cal-surface);
  border-bottom: 1px solid var(--cal-border);
}
[part~="title"] { flex: 1; min-width: 0; display: flex; align-items: baseline; justify-content: center; gap: 8px; }
[part~="month"] { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
[part~="zoom-label"] { font-size: 12px; color: var(--cal-text-dim); white-space: nowrap; }

[part~="button"] {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 28px; padding: 0 10px;
  border: 1px solid var(--cal-border); border-radius: var(--cal-radius);
  background: var(--cal-surface-raised);
  text-decoration: none; white-space: nowrap; cursor: pointer;
}
[part~="button"]:hover:not(:disabled) { border-color: var(--cal-text-faint); }
[part~="button"]:disabled { opacity: .4; cursor: default; }
[part~="icon"] { width: 30px; padding: 0; font-size: 16px; line-height: 1; }

[part~="layers"] { display: flex; flex: none; gap: 6px; }
[part~="layer"] {
  display: inline-flex; align-items: center; gap: 6px;
  height: 24px; padding: 0 9px;
  border: 1px solid var(--cal-border); border-radius: 999px;
  background: transparent; font-size: 12px; white-space: nowrap; cursor: pointer;
}
[part~="layer"]::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--dot); }
[part~="layer"][aria-pressed="false"] { opacity: .45; }

[part~="weekdays"] {
  display: flex; overflow: hidden;
  padding: 0 var(--cal-strip-width) 0 var(--cal-gutter-width);
  background: var(--cal-surface);
  border-bottom: 1px solid var(--cal-border);
}
[part~="weekday-row"] { display: flex; flex: none; will-change: transform; }
[part~="weekday"] {
  flex: none; width: var(--cal-column-width);
  padding: 5px 8px;
  font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase;
  color: var(--cal-text-dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
[part~="weekday"][data-weekend] { color: var(--cal-text-faint); }

[part~="body"] { position: relative; flex: 1; min-height: 0; overflow: hidden; }
[part~="canvas"] { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
[part~="drop-outline"] {
  position: absolute; inset: 6px; display: none; pointer-events: none;
  border: 2px dashed var(--cal-accent); border-radius: var(--cal-radius);
  background: var(--cal-selection);
}
[part~="body"][data-drop] [part~="drop-outline"] { display: block; }

[part~="group"] { display: flex; align-items: center; gap: 4px; }
[part~="filter"] {
  width: 190px; height: 28px; padding: 0 10px;
  border: 1px solid var(--cal-border); border-radius: var(--cal-radius);
  background: var(--cal-surface-raised);
  -webkit-user-select: text; user-select: text;
}


[part~="drag-image"] {
  position: fixed; top: -100px; left: 0;
  max-width: 240px; padding: 4px 10px;
  border-radius: 6px; background: var(--cal-surface-raised); color: var(--cal-text);
  font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

[part~="dialog"] {
  min-width: 260px; padding: 18px;
  border: 1px solid var(--cal-border); border-radius: var(--cal-radius);
  background: var(--cal-surface-raised); color: var(--cal-text);
  box-shadow: var(--cal-shadow);
}
[part~="dialog"]::backdrop { background: rgba(0,0,0,.35); }
[part~="dialog-text"] { margin: 0 0 16px; font-size: 14px; font-weight: 600; }
[part~="dialog-actions"] { display: flex; justify-content: flex-end; gap: 8px; }
[part~="danger"] { background: var(--cal-busy); border-color: var(--cal-busy); color: #fff; }

[part~="panel"] {
  position: absolute; left: 0; top: 0; z-index: 2;
  width: min(340px, calc(100% - 24px)); max-height: calc(100% - 8px);
  display: flex; flex-direction: column; overflow: hidden;
  padding-left: 6px;
  background: var(--cal-surface-raised);
  border: 1px solid var(--cal-border);
  border-radius: var(--cal-radius);
  box-shadow: var(--cal-shadow);
  -webkit-user-select: text; user-select: text;
}
[part~="panel"]::before {
  content: ""; position: absolute; left: 6px; top: 12px; bottom: 12px;
  width: 3px; border-radius: 3px; background: var(--event-color);
}
[part~="panel"][hidden] { display: none; }
[part~="panel-header"] { padding: 12px 14px 10px; border-bottom: 1px solid var(--cal-border); }
[part~="panel-top"] { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
[part~="panel-calendar"] { font-size: 12px; font-weight: 600; color: var(--event-color); }
[part~="panel-close"], [part~="panel-icon-button"] {
  width: 24px; height: 24px; padding: 0; flex: none;
  border: 0; border-radius: 6px; background: transparent;
  color: var(--cal-text-dim); font-size: 18px; line-height: 1; cursor: pointer;
}
[part~="panel-close"]:hover, [part~="panel-icon-button"]:hover { background: var(--cal-surface); color: var(--cal-text); }
[part~="panel-title"], [part~="panel-title-input"] {
  display: block; width: 100%; margin: 4px 0; padding: 2px 0;
  font-size: 17px; font-weight: 600; line-height: 1.3;
  border: 0; border-bottom: 1px solid transparent; background: transparent;
  overflow-wrap: anywhere;
}
[part~="panel-title-input"]:hover { border-bottom-color: var(--cal-border); }
[part~="panel-title-input"]:focus { outline: none; border-bottom-color: var(--cal-accent); }
[part~="panel-when"] { font-size: 12px; color: var(--cal-text-dim); }
[part~="panel-body"] { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 12px; padding: 12px 14px; }
[part~="panel-header"], [part~="panel-footer"] { flex: none; }
[part~="panel-section"] { display: flex; flex-direction: column; gap: 4px; }
[part~="panel-label"] { font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--cal-text-faint); }
[part~="panel-value"], [part~="panel-person"] { overflow-wrap: anywhere; }
[part~="panel-link"] { color: var(--cal-accent); overflow-wrap: anywhere; }
[part~="panel-join"] { align-self: flex-start; margin-top: 4px; background: var(--cal-accent); border-color: var(--cal-accent); color: var(--cal-accent-text); }
[part~="panel-participants"] { display: flex; flex-direction: column; gap: 3px; margin: 0; padding: 0; list-style: none; }
[part~="panel-participant"] { display: flex; justify-content: space-between; gap: 8px; }
[part~="panel-response"] { font-size: 12px; color: var(--cal-text-faint); white-space: nowrap; }
[part~="panel-participant"][data-status="accepted"] [part~="panel-response"] { color: #3ccf7e; }
[part~="panel-participant"][data-status="declined"] [part~="panel-response"] { color: var(--cal-busy); }
[part~="panel-participant"][data-status="tentative"] [part~="panel-response"] { color: var(--cal-now); }
[part~="panel-reminder"] { display: flex; align-items: center; gap: 6px; }
[part~="panel-select"] {
  flex: 1; height: 28px; padding: 0 6px;
  border: 1px solid var(--cal-border); border-radius: 6px; background: var(--cal-surface);
}
[part~="panel-empty"], [part~="panel-notice"] { font-size: 12px; color: var(--cal-text-dim); }
[part~="panel-notice"] { padding: 6px 8px; border-radius: 6px; background: var(--cal-surface); }
[part~="panel-add"] {
  align-self: flex-start; padding: 2px 0;
  border: 0; background: transparent;
  color: var(--cal-accent); font-size: 12px; cursor: pointer;
}
[part~="panel-description"] { white-space: pre-wrap; overflow-wrap: anywhere; }
[part~="panel-description"][data-clamped] {
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 6; line-clamp: 6; overflow: hidden;
}
[part~="panel-description-input"] {
  width: 100%; min-height: 80px; padding: 6px 8px; resize: vertical;
  border: 1px solid var(--cal-border); border-radius: 6px; background: var(--cal-surface);
  field-sizing: content; max-height: 260px;
}
[part~="panel-summary"] {
  display: flex; flex-direction: column; gap: 6px;
  padding: 8px 10px; border-radius: 6px; background: var(--cal-surface);
}
[part~="panel-summary-text"] { white-space: pre-wrap; }
[part~="panel-progress"] {
  height: 2px; border-radius: 2px; overflow: hidden;
  background: linear-gradient(90deg, transparent, var(--cal-accent), transparent) 0 0 / 40% 100% no-repeat var(--cal-border);
  animation: cal-progress 1.1s ease-in-out infinite;
}
@keyframes cal-progress { from { background-position: -40% 0; } to { background-position: 140% 0; } }
[part~="panel-footer"] { display: flex; gap: 6px; padding: 10px 14px 12px; border-top: 1px solid var(--cal-border); }
[part~="panel-respond"] { flex: 1; }
[part~="panel-respond"][aria-pressed="true"] { background: var(--cal-accent); border-color: var(--cal-accent); color: var(--cal-accent-text); }

@container (max-width: 1000px) {
  [part~="layer"] { width: 24px; padding: 0; justify-content: center; }
  [part~="layer-label"] { display: none; }
}
@container (max-width: 760px) {
  [part~="zoom-label"] { display: none; }
  [part~="filter"] { width: 140px; }
}
@container (max-width: 560px) {
  [part~="layers"], [part~="month-button"] { display: none; }
}
`;

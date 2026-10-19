const COLORS = {
  bg: "--cal-bg",
  gutter: "--cal-gutter-bg",
  line: "--cal-line",
  bandLine: "--cal-band-line",
  hourLine: "--cal-hour-line",
  noonLine: "--cal-noon-line",
  text: "--cal-text",
  textDim: "--cal-text-dim",
  textFaint: "--cal-text-faint",
  accent: "--cal-accent",
  accentText: "--cal-accent-text",
  now: "--cal-now",
  weekend: "--cal-weekend",
  todayBg: "--cal-today-bg",
  todayBorder: "--cal-today-border",
  eventText: "--cal-event-text",
  stripeColor: "--cal-stripe",
  selection: "--cal-selection",
  headingBg: "--cal-heading-bg",
  stripBg: "--cal-strip-bg",
  stripView: "--cal-strip-view",
  font: "--cal-font",
} as const;

const NUMBERS = {
  eventAlpha: "--cal-event-alpha",
} as const;

/** Lengths in `rem` or `px`, read in px for the canvas. */
const LENGTHS = {
  eventRadius: "--cal-event-radius",
  gutterWidth: "--cal-gutter-width",
  stripWidth: "--cal-strip-width",
} as const;

export type Theme = Record<keyof typeof COLORS, string> &
  Record<keyof typeof NUMBERS | keyof typeof LENGTHS, number> & {
    stripe: CanvasPattern;
    /** Root font size in px, all text and the space it needs is sized in multiples of it. */
    rem: number;
  };

/** Reads the theme tokens of the element so the canvas follows the same CSS variables as the DOM. */
export function readTheme(element: Element): Theme {
  const style = getComputedStyle(element);
  const read = (name: string) => {
    const value = style.getPropertyValue(name).trim();
    if (!value) throw new Error(`calendar: CSS variable ${name} is not set`);
    return value;
  };
  const number = (name: string, value: string) => {
    const result = Number.parseFloat(value);
    if (Number.isNaN(result)) throw new Error(`calendar: CSS variable ${name} is not a number`);
    return result;
  };
  const rem = number("font-size", getComputedStyle(document.documentElement).fontSize);
  const theme = {} as Record<string, string | number>;
  for (const [key, name] of Object.entries(COLORS)) theme[key] = read(name);
  for (const [key, name] of Object.entries(NUMBERS)) theme[key] = number(name, read(name));
  for (const [key, name] of Object.entries(LENGTHS)) {
    const value = read(name);
    if (value.endsWith("rem")) theme[key] = number(name, value) * rem;
    else if (value.endsWith("px") || value === "0") theme[key] = number(name, value);
    else throw new Error(`calendar: CSS variable ${name} must be a length in rem or px`);
  }
  return { ...(theme as Omit<Theme, "stripe" | "rem">), stripe: stripes(theme.stripeColor as string), rem };
}

function stripes(color: string): CanvasPattern {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 8;
  const ctx = tile.getContext("2d") as CanvasRenderingContext2D;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, 10);
  ctx.lineTo(10, -2);
  ctx.moveTo(6, 10);
  ctx.lineTo(10, 6);
  ctx.moveTo(-2, 2);
  ctx.lineTo(2, -2);
  ctx.stroke();
  return ctx.createPattern(tile, "repeat") as CanvasPattern;
}

const contrast = new Map<string, string>();
let probe: CanvasRenderingContext2D | null = null;

/** Black or white, whichever reads better on `color`. */
export function contrastText(color: string): string {
  let text = contrast.get(color);
  if (text) return text;
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data as unknown as [number, number, number];
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  text = luminance > 0.6 ? "#111" : "#fff";
  contrast.set(color, text);
  return text;
}

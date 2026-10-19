import type { CalendarModel, Preview } from "./model.ts";
import { DAY_NUMBER_SIZE, DAY_NUMBERS, type EventBox, MONTH_HEADER, MONTH_HEADING_SIZE, type MoreBox, type Scene, type SceneRow, textFade } from "./scene.ts";
import type { Strings } from "./strings.ts";
import { contrastText, type Theme } from "./theme.ts";
import { clamp, dateOf, weekNumber, weekOf } from "./time.ts";

export interface Paint {
  ctx: CanvasRenderingContext2D;
  scene: Scene;
  theme: Theme;
  model: CalendarModel;
}

/**
 * One drawing layer. `draw` paints inside the day columns, in layer order. `overlay` runs after
 * every layer has drawn and may paint anywhere, including the gutter.
 */
export interface Layer {
  id: string;
  /** Layers that can't be toggled are always drawn and get no header chip. */
  toggleable: boolean;
  label(strings: Strings): string;
  draw(paint: Paint): void;
  overlay?(paint: Paint): void;
}

interface Look {
  color: string;
  solid: boolean;
  alpha: number;
  glow: boolean;
  outline: boolean;
  stripes: boolean;
  dashed: boolean;
  text: string;
}

const crisp = (v: number) => Math.round(v) + 0.5;

/** Finest hour step whose spacing is at least `gap` pixels; all steps divide 12 so noon is always on it. */
const hourStep = (perHour: number, gap: number, steps: number[]) => steps.find((step) => step * perHour >= gap) ?? 6;
const LINE_STEPS = [1, 2, 4, 6];
const LABEL_STEPS = [1, 2, 3, 6];

/** 0 while rows are collapsed, 1 once they are tall enough to show their hours. */
const hoursAlpha = ({ scene, model }: Paint) => clamp((model.rowHeight - scene.geo.expandAt) / (scene.geo.expandAt * 0.8), 0, 1);

const fitted = new Map<string, string>();

/** Cuts text to `max` pixels with an ellipsis. */
function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (max <= 0) return "";
  const key = `${ctx.font}|${Math.round(max)}|${text}`;
  let result = fitted.get(key);
  if (result !== undefined) return result;
  if (ctx.measureText(text).width <= max) result = text;
  else {
    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (ctx.measureText(`${text.slice(0, mid)}…`).width <= max) lo = mid;
      else hi = mid - 1;
    }
    result = lo ? `${text.slice(0, lo).trimEnd()}…` : "";
  }
  if (fitted.size > 5000) fitted.clear();
  fitted.set(key, result);
  return result;
}

function hline(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number) {
  ctx.moveTo(x0, crisp(y));
  ctx.lineTo(x1, crisp(y));
}

function pill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, bg: string, fg: string) {
  const w = ctx.measureText(text).width + size;
  const h = size + 6;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + size / 2, y + h / 2 + 0.5);
  return w;
}

function clipColumns({ ctx, scene }: Paint) {
  const { geo } = scene;
  ctx.beginPath();
  ctx.rect(geo.gutter, 0, geo.width - geo.gutter - geo.strip, geo.height);
  ctx.clip();
}

// Grid

function drawGap({ ctx, scene, theme, model }: Paint, row: SceneRow) {
  const { geo } = scene;
  const y = crisp(row.top + row.height / 2);
  ctx.strokeStyle = theme.textFaint;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  hline(ctx, geo.gutter, geo.width - geo.strip, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `500 ${0.6875 * geo.rem}px ${theme.font}`;
  const text = model.strings.hiddenWeeks(row.gapWeeks);
  const w = ctx.measureText(text).width + 16;
  const x = geo.gutter + (geo.width - geo.gutter - geo.strip - w) / 2;
  ctx.fillStyle = theme.bg;
  ctx.fillRect(x, row.top, w, row.height);
  ctx.fillStyle = theme.textDim;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 8, row.top + row.height / 2);
}

function drawCells({ ctx, scene, theme }: Paint, row: SceneRow) {
  const { colWidth } = scene.geo;
  for (const day of row.days) {
    if (day.weekend || day.outside) {
      ctx.fillStyle = theme.weekend;
      ctx.fillRect(day.x, row.top, colWidth, row.height);
    }
    if (day.outside) {
      ctx.fillStyle = theme.stripe;
      ctx.fillRect(day.x, row.top, colWidth, row.height);
    }
    if (day.today) {
      ctx.fillStyle = theme.todayBg;
      ctx.fillRect(day.x, row.top, colWidth, row.height);
      ctx.strokeStyle = theme.todayBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(crisp(day.x), crisp(row.top), Math.round(colWidth) - 1, Math.round(row.height) - 1);
    }
  }
}

function drawLines({ ctx, scene, theme }: Paint, row: SceneRow) {
  const { geo } = scene;
  const left = geo.colsX;
  const right = geo.colsX + geo.colWidth * 7;
  ctx.lineWidth = 1;
  if (row.expanded) {
    const perHour = row.timeHeight / 24;
    const step = hourStep(perHour, 12, LINE_STEPS);
    ctx.strokeStyle = theme.hourLine;
    ctx.beginPath();
    for (let hour = step; hour < 24; hour += step) if (hour !== 12) hline(ctx, left, right, row.timeTop + hour * perHour);
    ctx.stroke();
    ctx.strokeStyle = theme.noonLine;
    ctx.beginPath();
    hline(ctx, left, right, row.timeTop + 12 * perHour);
    ctx.stroke();
  }
  // The band and the time area of a week only get a faint divider, the weeks are set apart by a stronger line.
  ctx.strokeStyle = theme.line;
  ctx.beginPath();
  for (let col = 1; col < 7; col++) {
    const x = crisp(left + col * geo.colWidth);
    ctx.moveTo(x, row.top);
    ctx.lineTo(x, row.top + row.height);
  }
  if (row.expanded) hline(ctx, left, right, row.timeTop);
  else hline(ctx, left, right, row.top + row.height - 1);
  ctx.stroke();
  if (row.expanded) {
    ctx.strokeStyle = theme.bandLine;
    ctx.beginPath();
    hline(ctx, left, right, row.top + row.height - 1);
    ctx.stroke();
  }
}

/** Bottom right of the week, below its events or its time area and clear of the month heading. */
function drawDayNumbers({ ctx, scene, theme, model }: Paint, row: SceneRow) {
  if (!row.numberAlpha) return;
  const size = DAY_NUMBER_SIZE * scene.geo.rem;
  const strip = DAY_NUMBERS * scene.geo.rem;
  // Sits at the top of its strip, the rest is room to the line below.
  const y = row.top + row.height - strip + 2;
  ctx.save();
  ctx.globalAlpha = row.numberAlpha;
  for (const day of row.days) {
    const date = dateOf(day.day);
    const first = date.getDate() === 1;
    const text = first ? model.formats.monthDay(date) : model.formats.dayNumber(date);
    ctx.font = `${first || day.today ? 700 : 500} ${size}px ${theme.font}`;
    const x = day.x + scene.geo.colWidth - 3 - ctx.measureText(text).width - size;
    if (day.today) pill(ctx, text, x, y, size, theme.accent, theme.accentText);
    else {
      ctx.fillStyle = first ? theme.text : theme.textDim;
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + size / 2, y + (size + 6) / 2 + 0.5);
    }
  }
  ctx.restore();
}

function drawNow(paint: Paint) {
  const { ctx, scene, theme } = paint;
  for (const row of scene.rows) {
    const today = row.expanded ? row.days.find((day) => day.today) : undefined;
    if (!today) continue;
    const y = row.timeTop + (scene.nowMinutes / 1440) * row.timeHeight;
    ctx.save();
    clipColumns(paint);
    ctx.strokeStyle = theme.now;
    ctx.fillStyle = theme.now;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(today.x, y);
    ctx.lineTo(today.x + scene.geo.colWidth, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(today.x + 3, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * The month heading of the top row sticks until the next month's heading pushes it away. Weeks that
 * start a month reserve a header for it above their events. The sticky one has no space of its own,
 * so it fades out while the hours fade in, where it would only cover them.
 */
function drawMonthHeadings(paint: Paint) {
  const { ctx, scene, theme, model } = paint;
  const rows = scene.rows.filter((row) => row.week !== null);
  const top = rows[0];
  if (!top) return;
  const size = MONTH_HEADING_SIZE * scene.geo.rem;
  const height = size + 6;
  const inset = (MONTH_HEADER * scene.geo.rem - height) / 2;
  const marks = rows.flatMap((row) =>
    row.days.filter((day) => dateOf(day.day).getDate() === 1 && row.top > 0).map((day) => ({ y: row.top, day: day.day })),
  );
  const next = marks[0];
  const sticky = { y: Math.min(0, next ? next.y - height - 8 : 0), day: top.start + 6 };
  ctx.save();
  clipColumns(paint);
  ctx.font = `700 ${size}px ${theme.font}`;
  // Only the sticky heading floats over events and needs a backdrop, the others sit in their own header.
  const draw = (mark: { y: number; day: number }, backdrop: string) =>
    pill(ctx, model.formats.monthYear(dateOf(mark.day)), scene.geo.gutter + 3, mark.y + inset, size, backdrop, theme.text);
  ctx.globalAlpha = 1 - hoursAlpha(paint);
  if (ctx.globalAlpha) draw(sticky, theme.headingBg);
  ctx.globalAlpha = 1;
  for (const mark of marks) draw(mark, "transparent");
  ctx.restore();
}

function drawGutter(paint: Paint) {
  const { ctx, scene, theme, model } = paint;
  const { geo } = scene;
  if (geo.gutter <= 0) return;
  ctx.fillStyle = theme.gutter;
  ctx.fillRect(0, 0, geo.gutter, geo.height);
  ctx.fillStyle = theme.line;
  ctx.fillRect(geo.gutter - 1, 0, 1, geo.height);
  const hours = hoursAlpha(paint);
  const thisWeek = weekOf(scene.today, scene.firstDay);
  ctx.textBaseline = "middle";
  for (const row of scene.rows) {
    if (row.week === null) continue;
    const size = 0.6875 * geo.rem;
    const fade = textFade(row.height * 0.6, size);
    if (hours < 1 && fade > 0) {
      const current = row.week === thisWeek;
      ctx.globalAlpha = (1 - hours) * fade;
      ctx.font = `${current ? 700 : 500} ${size}px ${theme.font}`;
      ctx.fillStyle = current ? theme.accent : theme.textFaint;
      ctx.textAlign = "right";
      ctx.fillText(model.strings.weekNumber(weekNumber(row.week, scene.firstDay)), geo.gutter - 6, row.top + row.height / 2);
    }
    if (hours > 0 && row.expanded) {
      const perHour = row.timeHeight / 24;
      const step = hourStep(perHour, geo.rem, LABEL_STEPS);
      const nowY = row.days.some((day) => day.today) ? row.timeTop + (scene.nowMinutes / 1440) * row.timeHeight : null;
      ctx.globalAlpha = hours;
      ctx.font = `500 ${0.625 * geo.rem}px ${theme.font}`;
      ctx.fillStyle = theme.textFaint;
      ctx.textAlign = "right";
      for (let hour = step; hour < 24; hour += step) {
        const y = row.timeTop + hour * perHour;
        if (nowY !== null && Math.abs(nowY - y) < 0.625 * geo.rem) continue;
        ctx.fillText(model.formats.hour(hour), geo.gutter - 6, y);
      }
      if (nowY !== null) {
        ctx.font = `700 ${0.625 * geo.rem}px ${theme.font}`;
        ctx.textAlign = "left";
        const text = model.formats.time(new Date());
        const size = 0.5 * geo.rem;
        const w = ctx.measureText(text).width + size;
        pill(ctx, text, Math.max(2, geo.gutter - w - 3), nowY - (size + 6) / 2, size, theme.now, theme.bg);
      }
    }
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

export const gridLayer: Layer = {
  id: "grid",
  toggleable: false,
  label: (strings) => strings.layers.grid,
  draw(paint) {
    for (const row of paint.scene.rows) {
      if (row.week === null) {
        drawGap(paint, row);
        continue;
      }
      drawCells(paint, row);
      drawLines(paint, row);
      drawDayNumbers(paint, row);
    }
    if (!paint.scene.rows.length && paint.model.filter) {
      const { ctx, scene, theme, model } = paint;
      ctx.font = `500 ${0.8125 * scene.geo.rem}px ${theme.font}`;
      ctx.fillStyle = theme.textDim;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(model.strings.noMatches, (scene.geo.gutter + scene.geo.width - scene.geo.strip) / 2, scene.geo.height / 2);
      ctx.textAlign = "left";
    }
  },
  overlay(paint) {
    drawNow(paint);
    drawMonthHeadings(paint);
    drawGutter(paint);
  },
};

// Off hours

export const offHoursLayer: Layer = {
  id: "off-hours",
  toggleable: true,
  label: (strings) => strings.layers["off-hours"],
  draw({ ctx, scene, theme, model }) {
    const [from, to] = model.workHours;
    ctx.fillStyle = theme.offHours;
    for (const row of scene.rows) {
      if (!row.expanded) continue;
      const perHour = row.timeHeight / 24;
      for (const day of row.days) {
        if (day.weekend) continue;
        ctx.fillRect(day.x, row.timeTop, scene.geo.colWidth, from * perHour);
        ctx.fillRect(day.x, row.timeTop + to * perHour, scene.geo.colWidth, (24 - to) * perHour);
      }
    }
  },
};

// Busyness

export const busynessLayer: Layer = {
  id: "busyness",
  toggleable: true,
  label: (strings) => strings.layers.busyness,
  draw({ ctx, scene, theme, model }) {
    ctx.fillStyle = theme.busy;
    for (const row of scene.rows) {
      for (const day of row.days) {
        const value = model.busyness(day.day);
        if (!value) continue;
        ctx.globalAlpha = value * theme.busyAlpha;
        ctx.fillRect(day.x, row.top, scene.geo.colWidth, row.height);
      }
    }
    ctx.globalAlpha = 1;
  },
};

// Events

function lookOf(model: CalendarModel, theme: Theme, box: EventBox): Look {
  const { event } = box;
  const color = model.colorOf(event);
  const selected = model.selection.has(event.id);
  const hovered = model.hoverId === event.id;
  const solid = selected || hovered;
  return {
    color,
    solid,
    alpha: model.canEdit(event) ? 1 : 0.5,
    glow: hovered && !selected,
    outline: selected,
    stripes: model.unconfirmed(event),
    dashed: false,
    text: solid ? contrastText(color) : theme.eventText,
  };
}

function previewLook(model: CalendarModel, theme: Theme, preview: Preview): Look {
  const { style, event } = preview;
  const color = style === "copy" ? theme.accent : model.colorOf(event);
  const base = { color, solid: false, glow: false, outline: false, stripes: false, dashed: false, text: theme.eventText };
  if (style === "create") return { ...base, alpha: 1, dashed: true, text: theme.text };
  if (style === "live") return { ...base, alpha: 1, solid: true, glow: true, text: contrastText(color) };
  return { ...base, alpha: 0.6 };
}

const hasLine = (box: EventBox, look: Look) => !look.dashed && (box.area === "time" || box.isStart);

function drawEvent(paint: Paint, box: EventBox, look: Look, label: string | null) {
  const { ctx, theme } = paint;
  const vertical = box.area === "time";
  const r = Math.min(theme.eventRadius, box.h / 2, box.w / 2);
  const startR = box.isStart ? r : 0;
  const endR = box.isEnd ? r : 0;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, vertical ? [startR, startR, endR, endR] : [startR, endR, endR, startR]);
  ctx.fillStyle = look.color;
  if (look.glow) {
    // Faint pass that only contributes the shadow; the real fill below covers the block itself.
    ctx.shadowColor = look.color;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.globalAlpha = look.alpha * 0.35;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.globalAlpha = look.alpha * (look.solid ? 1 : theme.eventAlpha);
  ctx.fill();
  ctx.globalAlpha = look.alpha;
  if (look.dashed) {
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = look.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (look.outline) {
    ctx.strokeStyle = theme.text;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.clip();
  if (hasLine(box, look)) {
    // A free-standing pill inset from the edge, so it doesn't follow the block's corner radius.
    // On solid blocks it takes the text colour so it stays visible and the title doesn't move.
    const inset = Math.min(2, box.h / 4);
    if (look.solid) {
      ctx.fillStyle = look.text;
      ctx.globalAlpha = look.alpha * 0.55;
    }
    ctx.beginPath();
    ctx.roundRect(box.x + 2, box.y + inset, 3, box.h - 2 * inset, 1.5);
    ctx.fill();
    ctx.globalAlpha = look.alpha;
  }
  if (look.stripes) {
    ctx.fillStyle = theme.stripe;
    ctx.fillRect(box.x, box.y, box.w, box.h);
  }
  drawEventText(paint, box, look, label);
  ctx.restore();
}

function drawEventText({ ctx, scene, theme, model }: Paint, box: EventBox, look: Look, label: string | null) {
  if (!box.label) return;
  const vertical = box.area === "time";
  const size = 0.75 * scene.geo.rem;
  const fade = textFade(vertical ? box.h - 4 : box.h * 0.72, size);
  if (!fade || box.w < 18) return;
  ctx.globalAlpha *= fade;
  const { event } = box;
  const title = look.dashed && label ? label : `${event.recurring ? "↻ " : ""}${event.title || model.strings.untitled}`;
  const x = box.x + (hasLine(box, look) ? 9 : 6);
  const max = box.x + box.w - x - 3;
  ctx.fillStyle = look.text;
  ctx.font = `500 ${size}px ${theme.font}`;
  if (!vertical) {
    ctx.textBaseline = "middle";
    ctx.fillText(fit(ctx, title, max), x, box.y + box.h / 2 + 0.5);
    return;
  }
  ctx.textBaseline = "top";
  ctx.fillText(fit(ctx, title, max), x, box.y + 3);
  const small = size * 0.88;
  if (box.h < size + small + 8) return;
  ctx.font = `${small}px ${theme.font}`;
  ctx.globalAlpha *= 0.75;
  const second = label && !look.dashed ? label : model.formats.eventTime(event);
  ctx.fillText(fit(ctx, second, max), x, box.y + 5 + size);
}

function drawMore({ ctx, scene, theme, model }: Paint, more: MoreBox) {
  const size = 0.6875 * scene.geo.rem;
  const fade = textFade(more.h * 0.8, size);
  if (!fade) {
    ctx.fillStyle = theme.textFaint;
    ctx.fillRect(more.x + 2, more.y + more.h / 2 - 1, Math.min(more.w - 4, 14), 2);
    return;
  }
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.font = `600 ${size}px ${theme.font}`;
  ctx.fillStyle = theme.textDim;
  ctx.textBaseline = "middle";
  const full = model.strings.more(more.count);
  const text = ctx.measureText(full).width <= more.w - 6 ? full : model.strings.moreShort(more.count);
  ctx.fillText(fit(ctx, text, more.w - 6), more.x + 3, more.y + more.h / 2 + 0.5);
  ctx.restore();
}

export const eventsLayer: Layer = {
  id: "events",
  toggleable: true,
  label: (strings) => strings.layers.events,
  draw(paint) {
    const { scene, theme, model } = paint;
    for (const box of scene.boxes) {
      if (box.event.id !== model.hiddenId) drawEvent(paint, box, lookOf(model, theme, box), null);
    }
    for (const more of scene.more) drawMore(paint, more);
    const preview = model.preview;
    if (preview) {
      const look = previewLook(model, theme, preview);
      for (const box of scene.preview) drawEvent(paint, box, look, preview.label);
    }
  },
};

/** Box selection rectangle. Not toggleable and not listed in the header. */
export const interactionLayer: Layer = {
  id: "interaction",
  toggleable: false,
  label: () => "",
  draw({ ctx, theme, model }) {
    const rect = model.selectionRect;
    if (!rect) return;
    ctx.fillStyle = theme.selection;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = theme.accent;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.strokeRect(crisp(rect.x), crisp(rect.y), Math.round(rect.w), Math.round(rect.h));
    ctx.setLineDash([]);
  },
};

export const defaultLayers: Layer[] = [gridLayer, offHoursLayer, busynessLayer, eventsLayer, interactionLayer];

/** Overview of all loaded weeks with the visible part boxed. */
export function drawStrip({ ctx, scene, theme, model }: Paint) {
  const { geo } = scene;
  const x = geo.width - geo.strip;
  const [u0, u1] = scene.strip;
  const scale = geo.height / (u1 - u0);
  const col = (geo.strip - 4) / 7;
  ctx.fillStyle = theme.stripBg;
  ctx.fillRect(x, 0, geo.strip, geo.height);
  ctx.fillStyle = theme.line;
  ctx.fillRect(x, 0, 1, geo.height);
  ctx.globalAlpha = 0.55;
  for (const mark of model.stripMarks) {
    const y = (mark.unit - u0) * scale;
    const h = Math.max(1, mark.span * scale - 1);
    if (y > geo.height || y + h < 0) continue;
    ctx.fillStyle = mark.color;
    ctx.fillRect(x + 2 + mark.col * col, y, Math.max(1, col), h);
  }
  ctx.globalAlpha = 1;
  const rows = model.rows;
  const top = (rows.pxToUnit(geo.scrollTop) - u0) * scale;
  const bottom = (rows.pxToUnit(geo.scrollTop + geo.height) - u0) * scale;
  ctx.fillStyle = theme.stripView;
  ctx.fillRect(x + 1, top, geo.strip - 1, Math.max(3, bottom - top));
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1.5, crisp(top), geo.strip - 2, Math.max(3, Math.round(bottom - top)));
}

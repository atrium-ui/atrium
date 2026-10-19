import { clamp } from "./time.ts";

export type Row = { kind: "week"; week: number } | { kind: "gap"; weeks: number };

/**
 * Maps between row units and content pixels. A unit is a row index plus the fraction inside
 * that row, so positions stay put while the zoom changes. Without a filter there is one row
 * per week, endlessly, and the row index is the week index. With a filter the rows are a
 * finite list of weeks and collapsed gaps.
 */
export class Rows {
  readonly offsets: number[] = [];
  readonly index = new Map<number, number>();

  constructor(
    readonly rowHeight: number,
    readonly gapHeight: number,
    readonly items: Row[] | null,
    /** Week reported for any position when a filter matches nothing. */
    readonly origin: number,
  ) {
    if (!items) return;
    let y = 0;
    items.forEach((row, i) => {
      this.offsets.push(y);
      if (row.kind === "week") this.index.set(row.week, i);
      y += row.kind === "week" ? rowHeight : gapHeight;
    });
    this.offsets.push(y);
  }

  get first() {
    return this.items ? 0 : Number.NEGATIVE_INFINITY;
  }

  get end() {
    return this.items ? this.items.length : Number.POSITIVE_INFINITY;
  }

  row(i: number): Row {
    if (!this.items) return { kind: "week", week: i };
    const row = this.items[i];
    if (!row) throw new RangeError(`Row ${i} is out of range`);
    return row;
  }

  heightOf(i: number): number {
    return this.items?.[i]?.kind === "gap" ? this.gapHeight : this.rowHeight;
  }

  unitToPx(unit: number): number {
    if (!this.items) return unit * this.rowHeight;
    if (!this.items.length) return 0;
    const i = clamp(Math.floor(unit), 0, this.items.length - 1);
    return (this.offsets[i] as number) + (unit - i) * this.heightOf(i);
  }

  pxToUnit(px: number): number {
    if (!this.items) return px / this.rowHeight;
    if (!this.items.length) return 0;
    let lo = 0;
    let hi = this.items.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if ((this.offsets[mid] as number) <= px) lo = mid;
      else hi = mid - 1;
    }
    return lo + (px - (this.offsets[lo] as number)) / this.heightOf(lo);
  }

  /** Unit of a (fractional) week, or the nearest visible position when the week is filtered away. */
  unitOfWeek(week: number): number {
    if (!this.items) return week;
    const whole = Math.floor(week);
    const exact = this.index.get(whole);
    if (exact !== undefined) return exact + week - whole;
    let best = 0;
    let distance = Number.POSITIVE_INFINITY;
    for (const [candidate, i] of this.index) {
      const d = Math.abs(candidate - week);
      if (d < distance) {
        distance = d;
        best = candidate < week ? i + 1 : i;
      }
    }
    return best;
  }

  weekOfUnit(unit: number): number {
    if (!this.items) return unit;
    if (!this.items.length) return this.origin;
    const i = clamp(Math.floor(unit), 0, this.items.length - 1);
    const fraction = clamp(unit - i, 0, 1);
    const row = this.items[i] as Row;
    if (row.kind === "week") return row.week + fraction;
    const before = this.items[i - 1];
    if (before?.kind !== "week") throw new Error("A gap row must follow a week row");
    return before.week + 1 + fraction * row.weeks;
  }
}

/** Rows for a filter: weeks with matches plus `context` weeks around them, gaps in between. */
export function filterRows(weeks: Iterable<number>, context: number): Row[] {
  const visible = new Set<number>();
  for (const week of weeks) for (let c = -context; c <= context; c++) visible.add(week + c);
  const sorted = [...visible].sort((a, b) => a - b);
  const rows: Row[] = [];
  sorted.forEach((week, i) => {
    const previous = sorted[i - 1];
    if (previous !== undefined && week - previous > 1) rows.push({ kind: "gap", weeks: week - previous - 1 });
    rows.push({ kind: "week", week });
  });
  return rows;
}

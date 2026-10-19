const DAY_MS = 86_400_000;
export const DAY_MINUTES = 1440;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const mod = (value: number, n: number) => ((value % n) + n) % n;

/** Local calendar day as an integer: days since 1970-01-01. Immune to DST. */
export function dayOf(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

/** Local date `minutes` after midnight of `day`. */
export function dateOf(day: number, minutes = 0): Date {
  const utc = new Date(day * DAY_MS);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 0, minutes);
}

export function minutesOf(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

/** Shifts by calendar days and wall-clock minutes, keeping the local time across DST changes. */
export function shift(date: Date, days: number, minutes = 0): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    date.getHours(),
    date.getMinutes() + minutes,
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

/** 0 = Sunday. */
export function weekdayOf(day: number): number {
  return mod(day + 4, 7);
}

export function isWeekend(day: number): boolean {
  const weekday = weekdayOf(day);
  return weekday === 0 || weekday === 6;
}

export function weekOf(day: number, firstDay: number): number {
  return Math.floor((day - mod(firstDay - 4, 7)) / 7);
}

export function weekStart(week: number, firstDay: number): number {
  return week * 7 + mod(firstDay - 4, 7);
}

/** Last calendar day an event touches. */
export function lastDayOf(event: { start: Date; end: Date; allDay: boolean }): number {
  const first = dayOf(event.start);
  const end = dayOf(event.end);
  if (event.allDay) return Math.max(first, end - 1);
  return Math.max(first, minutesOf(event.end) === 0 ? end - 1 : end);
}

/** Minutes of `day` covered by a timed event spanning days `first`..`last`. */
export function minutesOn(
  event: { start: Date; end: Date },
  day: number,
  first: number,
  last: number,
): [number, number] {
  const start = day === first ? minutesOf(event.start) : 0;
  const end = day === last && dayOf(event.end) === last ? minutesOf(event.end) : DAY_MINUTES;
  return [start, Math.max(start, end)];
}

/** ISO week numbers when weeks start on Monday, otherwise the week containing January 1st is week 1. */
export function weekNumber(week: number, firstDay: number): number {
  const start = weekStart(week, firstDay);
  if (firstDay === 1) {
    const thursday = start + 3;
    return Math.floor((thursday - dayOf(new Date(dateOf(thursday).getFullYear(), 0, 1))) / 7) + 1;
  }
  const jan1 = dayOf(new Date(dateOf(start + 6).getFullYear(), 0, 1));
  return week - weekOf(jan1, firstDay) + 1;
}

export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIsoDate(text: string): Date {
  const [year, month, day] = text.split("-").map(Number);
  if (!year || !month || !day) throw new Error(`Invalid date "${text}"`);
  return new Date(year, month - 1, day);
}

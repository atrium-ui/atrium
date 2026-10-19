import type { Strings } from "./strings.ts";
import { dateOf, dayOf, lastDayOf } from "./time.ts";
import type { CalendarEvent } from "./types.ts";

type WeekInfoLocale = Intl.Locale & {
  getWeekInfo?: () => { firstDay: number };
  weekInfo?: { firstDay: number };
};

/** First day of the week for a region, 0 = Sunday. */
export function regionFirstDay(locale: string): number {
  const info = new Intl.Locale(locale) as WeekInfoLocale;
  const week = info.getWeekInfo?.() ?? info.weekInfo;
  // Browsers without Intl week info (Firefox) get the ISO week. Hosts can set `firstDayOfWeek`.
  return week ? week.firstDay % 7 : 1;
}

/** Locale aware formatting of everything the calendar writes about dates and times. */
export class Formats {
  readonly hour12: boolean;
  readonly cache = new Map<string, Intl.DateTimeFormat>();
  readonly units = new Map<string, Intl.NumberFormat>();
  readonly eventTimes = new WeakMap<CalendarEvent, string>();

  constructor(readonly locale: string) {
    const cycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
    this.hour12 = cycle === "h11" || cycle === "h12";
  }

  dtf(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = JSON.stringify(options);
    let format = this.cache.get(key);
    if (!format) {
      format = new Intl.DateTimeFormat(this.locale, options);
      this.cache.set(key, format);
    }
    return format;
  }

  monthYear(date: Date) {
    return this.dtf({ month: "long", year: "numeric" }).format(date);
  }

  monthDay(date: Date) {
    return this.dtf({ month: "short", day: "numeric" }).format(date);
  }

  dayNumber(date: Date) {
    return this.dtf({ day: "numeric" }).format(date);
  }

  weekdayShort(date: Date) {
    return this.dtf({ weekday: "short" }).format(date);
  }

  time(date: Date) {
    return this.dtf({ hour: "numeric", minute: "2-digit" }).format(date);
  }

  /** Gutter label for an hour of the day. */
  hour(hour: number) {
    const date = new Date(2000, 0, 1, hour);
    return this.hour12
      ? this.dtf({ hour: "numeric" }).format(date)
      : this.dtf({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
  }

  timeRange(start: Date, end: Date) {
    return this.dtf({ hour: "numeric", minute: "2-digit" }).formatRange(start, end);
  }

  dayRange(first: Date, last: Date) {
    return this.dtf({ weekday: "short", month: "short", day: "numeric" }).formatRange(first, last);
  }

  dayLong(date: Date) {
    return this.dtf({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
  }

  dayShort(date: Date) {
    return this.dtf({ weekday: "short", day: "numeric", month: "short" }).format(date);
  }

  dateTime(date: Date) {
    return this.dtf({ weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(date);
  }

  /** Time range of a timed event, cached per event object. */
  eventTime(event: CalendarEvent) {
    let text = this.eventTimes.get(event);
    if (text === undefined) {
      text = this.timeRange(event.start, event.end);
      this.eventTimes.set(event, text);
    }
    return text;
  }

  /** Date and time of an event, one entry per line. */
  when(event: CalendarEvent): string[] {
    const first = dayOf(event.start);
    const last = lastDayOf(event);
    if (event.allDay) return first === last ? [this.dayLong(event.start)] : [this.dayLong(event.start), this.dayLong(dateOf(last))];
    if (first === last) return [this.dayLong(event.start), this.timeRange(event.start, event.end)];
    return [this.dateTime(event.start), this.dateTime(event.end)];
  }

  unit(value: number, unit: "minute" | "hour" | "day", display: "long" | "narrow") {
    const key = `${unit}:${display}`;
    let format = this.units.get(key);
    if (!format) {
      format = new Intl.NumberFormat(this.locale, { style: "unit", unit, unitDisplay: display });
      this.units.set(key, format);
    }
    return format.format(value);
  }

  duration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const rest = Math.round(minutes - hours * 60);
    const parts: string[] = [];
    if (hours) parts.push(this.unit(hours, "hour", "narrow"));
    if (rest || !hours) parts.push(this.unit(rest, "minute", "narrow"));
    return parts.join(" ");
  }

  reminder(minutes: number, strings: Strings) {
    if (minutes === 0) return strings.atStart;
    if (minutes % 1440 === 0) return strings.before(this.unit(minutes / 1440, "day", "long"));
    if (minutes % 60 === 0) return strings.before(this.unit(minutes / 60, "hour", "long"));
    return strings.before(this.unit(minutes, "minute", "long"));
  }
}

export interface CalendarLocaleConfig {
  locale: string;
  weekStart?: number;
}

export class CalendarInternal {
  locale: string;
  weekStart?: number;

  filter?: string;

  // TODO: dont instantiate a class for this, wasted memory
  constructor(config: CalendarLocaleConfig) {
    this.locale = config.locale;
    this.weekStart = config.weekStart;
  }

  // TODO: also do layouting to compute selection etc.

  generateWeeks(startDate, endDate): void {
    const weeks = [];
    let current = new Date(startDate);

    while (current < endDate) {
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(new Date(current));
        current = CalendarInternal.addDays(current, 1);
      }

      const firstDay = days[0];
      const thursday = days[3];
      if (firstDay && thursday) {
        weeks.push({
          weekNumber: CalendarInternal.getWeekNumber(firstDay),
          year: thursday.getFullYear(), // Use Thursday for year
          days,
          yOffset: 0,
        });
      }
    }

    let y = 0;

    if (this.filter) {
      const filteredEvents = this.getFilteredEvents();

      // Pre-compute event date ranges once (avoiding repeated startOfDayTime/endOfDayTime calls)
      const eventRanges = filteredEvents.map(e => ({
        start: CalendarInternal.startOfDayTime(e.start),
        end: CalendarInternal.endOfDayTime(e.end),
      }));

      for (const week of weeks) {
        week.yOffset = y;

        // Check if any day in this week overlaps any event range
        const weekStartTime = week.days[0]?.getTime() ?? 0;
        const weekEndTime = week.days[6]?.getTime() ?? 0;

        // Quick check: skip if week is entirely outside all event ranges
        const hasEvents = eventRanges.some(
          range => range.end >= weekStartTime && range.start <= weekEndTime,
        );

        // TODO: height should be determined by the renderer
        week.height = hasEvents ? this.dayHeight : 0;
        y += week.height;
      }
    } else {
      for (const week of weeks) {
        week.yOffset = y;
        week.height = this.dayHeight;
        y += week.height;
      }
    }

    this.totalHeight = y;

    return weeks;
  }

  getFilteredEvents(): CalendarEvent[] {
    // TODO
  }

  getVisibleMonths(): VisibleMonth[] {
    // TODO
  }

  // TODO: this getter is a waste of cpu time
  get firstDayOfWeek(): number {
    if (this.weekStart !== undefined) {
      return this.weekStart;
    }
    // Use Intl to determine locale's week start
    // Most locales start on Monday (1), US/Canada start on Sunday (0)
    const sundayLocales = ["en-US", "en-CA", "ja-JP", "ko-KR", "zh-TW"];
    const lang = this.locale.split("-")[0];
    if (sundayLocales.includes(this.locale) || lang === "he" || lang === "ar") {
      return 0;
    }
    return 1;
  }

  getWeekdayNames(): string[] {
    const formatter = new Intl.DateTimeFormat(this.locale, { weekday: "short" });
    const names: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (this.firstDayOfWeek + i) % 7;
      // Jan 7, 2024 is a Sunday (0)
      const date = new Date(2024, 0, 7 + dayIndex);
      names.push(formatter.format(date));
    }
    return names;
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day - this.firstDayOfWeek + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  static isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  static addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  // Returns timestamp for start of day using pure math (no Date object creation)
  static startOfDayTime(date: Date | undefined): number {
    if (!date) return 0;
    const time = date.getTime();
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return time - ((time - timezoneOffset) % 86400000);
  }

  // Returns timestamp for end of day using pure math (no Date object creation)
  static endOfDayTime(date: Date | undefined): number {
    if (!date) return 0;
    return CalendarInternal.startOfDayTime(date) + 86400000 - 1;
  }
}

import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

/**
 * Calendar element for date or date-range selection.
 * Supports different locales, week start configuration, and leap years.
 *
 * @customEvent change - Fired when the value changes (selection complete).
 * @customEvent input - Fired during range selection (intermediate states).
 *
 * @example Single date selection
 * ```html
 * <a-calendar name="date" value="2024-03-15"></a-calendar>
 * ```
 *
 * @example Date range selection
 * ```html
 * <a-calendar mode="range" name="dates" value="2024-03-15/2024-03-20"></a-calendar>
 * ```
 *
 * @example Custom locale and week start
 * ```html
 * <a-calendar locale="de-DE" week-start="1"></a-calendar>
 * ```
 */
export class CalendarElement extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: inherit;
      user-select: none;

      --_hover-bg: var(--calendar-hover-bg, rgba(0, 0, 0, 0.1));
      --_selected-bg: var(--calendar-selected-bg, #1d4ed8);
      --_selected-color: var(--calendar-selected-color, white);
      --_range-bg: var(--calendar-range-bg, rgba(29, 78, 216, 0.2));
      --_highlight-bg: var(--calendar-highlight-bg, rgba(234, 179, 8, 0.4));
      --_focus-outline: var(--calendar-focus-outline, currentColor);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .header-title {
      flex: 1;
      text-align: center;
      font-weight: 600;
    }

    .nav-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      font-size: 1rem;
      color: inherit;
    }

    .nav-btn:hover {
      opacity: 0.7;
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 0.75rem;
      opacity: 0.6;
      margin-bottom: 0.25rem;
    }

    .weekday {
      padding: 0.25rem;
    }

    .days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
    }

    .day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      background: none;
      border: none;
      color: inherit;
      padding: 0;
    }

    .day:hover:not([disabled]) {
      background: var(--_hover-bg);
      color: inherit;
    }

    .day[data-other-month] {
      opacity: 0.3;
    }

    .day[data-today] {
      font-weight: bold;
      text-decoration: underline;
    }

    .day[data-in-range] {
      background: var(--_range-bg);
      border-radius: 0;
    }

    .day[data-selected]:not([disabled]) {
      background: var(--_selected-bg);
      color: var(--_selected-color);
    }

    .day[data-range-start] {
      border-radius: 0.25rem 0 0 0.25rem;
    }

    .day[data-range-end] {
      border-radius: 0 0.25rem 0.25rem 0;
    }

    .day[data-range-start][data-range-end] {
      border-radius: 0.25rem;
    }

    .day[disabled] {
      opacity: 0.3;
      cursor: not-allowed;
    }

    :host(:focus-visible) .day[data-focused] {
      outline: 2px solid var(--_focus-outline);
      outline-offset: -2px;
    }

    .day[data-highlighted] {
      background: var(--_highlight-bg);
    }

    .day[data-highlight-start] {
      border-radius: 0.25rem 0 0 0.25rem;
    }

    .day[data-highlight-end] {
      border-radius: 0 0.25rem 0.25rem 0;
    }

    .day[data-highlight-start][data-highlight-end] {
      border-radius: 0.25rem;
    }
  `;

  /**
   * FormData name of the field.
   */
  @property({ type: String })
  name?: string;

  /**
   * The value of the field.
   * Single mode: "YYYY-MM-DD"
   * Range mode: "YYYY-MM-DD/YYYY-MM-DD"
   */
  @property({ type: String, reflect: true })
  value?: string;

  /**
   * Selection mode: "single" for single date, "range" for date range.
   */
  @property({ type: String, reflect: true })
  mode: "single" | "range" = "single";

  /**
   * BCP 47 locale tag for month/day names.
   */
  @property({ type: String })
  locale: string = navigator.language;

  /**
   * First day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
   * Defaults to locale-appropriate value.
   */
  @property({ type: Number, attribute: "week-start" })
  weekStart?: number;

  /**
   * Minimum selectable date (YYYY-MM-DD).
   */
  @property({ type: String })
  min?: string;

  /**
   * Maximum selectable date (YYYY-MM-DD).
   */
  @property({ type: String })
  max?: string;

  /**
   * Dates or ranges to highlight visually.
   * Comma-separated list of dates (YYYY-MM-DD) or ranges (YYYY-MM-DD/YYYY-MM-DD).
   * @example "2024-03-15" - single date
   * @example "2024-03-15/2024-03-20" - date range
   * @example "2024-03-15,2024-03-20/2024-03-25,2024-04-01" - multiple
   */
  @property({ type: String })
  highlight?: string;

  /**
   * Dates or ranges to mark as unavailable.
   * Comma-separated list of dates (YYYY-MM-DD) or ranges (YYYY-MM-DD/YYYY-MM-DD).
   * @example "2024-03-15" - single date
   * @example "2024-03-15/2024-03-20" - date range
   * @example "2024-03-15,2024-03-20/2024-03-25,2024-04-01" - multiple
   */
  @property({ type: String })
  unavailable?: string;

  /**
   * Whether the calendar is disabled.
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Currently displayed month/year for navigation.
   */
  @state()
  viewDate: Date = new Date();

  /**
   * Temporary range start during range selection.
   */
  @state()
  rangeStart?: string;

  /**
   * Hovered date for range preview.
   */
  @state()
  hoverDate?: string;

  /**
   * Currently focused date for keyboard navigation.
   */
  @state()
  focusedDate?: string;

  input = document.createElement("input");

  connectedCallback() {
    super.connectedCallback();
    this.tabIndex = 0;

    if (this.value) {
      const parsed = this.parseValue(this.value);
      if (parsed.start) {
        this.viewDate = this.parseDate(parsed.start);
        this.focusedDate = parsed.start;
      }
    } else if (this.highlight) {
      const highlights = this.parseHighlight();
      if (highlights.length > 0) {
        const earliest = highlights.map((h) => h.start).sort()[0]!;
        this.viewDate = this.parseDate(earliest);
        this.focusedDate = earliest;
      }
    }

    if (!this.focusedDate) {
      this.focusedDate = this.formatDate(new Date());
    }

    if (this.name) {
      this.append(this.input);
      this.input.type = "hidden";
      this.input.name = this.name;
      this.input.value = this.value || "";
    }

    this.addEventListener("keydown", this.onKeyDown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this.onKeyDown);
    this.input.remove();
  }

  /**
   * Get the effective week start day, using locale default if not set.
   */
  get effectiveWeekStart(): number {
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

  /**
   * Format a date as YYYY-MM-DD.
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse a YYYY-MM-DD string into a Date (local time).
   */
  parseDate(str: string): Date {
    const [year, month, day] = str.split("-").map(Number);
    return new Date(year!, month! - 1, day);
  }

  /**
   * Parse the value property into start/end dates.
   */
  parseValue(val: string): { start?: string; end?: string } {
    if (!val) return {};
    if (this.mode === "range" && val.includes("/")) {
      const [start, end] = val.split("/");
      return { start, end };
    }
    return { start: val };
  }

  /**
   * Get localized weekday names starting from the configured week start.
   */
  getWeekdayNames(): string[] {
    const formatter = new Intl.DateTimeFormat(this.locale, { weekday: "short" });
    const names: string[] = [];
    // Jan 4, 2024 is a Thursday - use it to get all weekday names
    for (let i = 0; i < 7; i++) {
      const dayIndex = (this.effectiveWeekStart + i) % 7;
      // Jan 7, 2024 is a Sunday (0)
      const date = new Date(2024, 0, 7 + dayIndex);
      names.push(formatter.format(date));
    }
    return names;
  }

  /**
   * Get the localized month and year string.
   */
  getMonthYearString(): string {
    const formatter = new Intl.DateTimeFormat(this.locale, {
      month: "long",
      year: "numeric",
    });
    return formatter.format(this.viewDate);
  }

  /**
   * Get all days to display in the current month view.
   */
  getDaysInView(): Array<{ date: Date; dateStr: string; isOtherMonth: boolean }> {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Find the first day to display (might be from previous month)
    const firstDayOfWeek = firstOfMonth.getDay();
    const daysFromPrevMonth = (firstDayOfWeek - this.effectiveWeekStart + 7) % 7;

    const days: Array<{ date: Date; dateStr: string; isOtherMonth: boolean }> = [];

    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        dateStr: this.formatDate(date),
        isOtherMonth: true,
      });
    }

    // Current month days
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push({
        date,
        dateStr: this.formatDate(date),
        isOtherMonth: false,
      });
    }

    // Next month days to fill the grid (always show 6 weeks = 42 days)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({
        date,
        dateStr: this.formatDate(date),
        isOtherMonth: true,
      });
    }

    return days;
  }

  /**
   * Check if a date string is today.
   */
  isToday(dateStr: string): boolean {
    return dateStr === this.formatDate(new Date());
  }

  /**
   * Check if a date is selected.
   */
  isSelected(dateStr: string): boolean {
    const { start, end } = this.parseValue(this.value || "");
    return dateStr === start || dateStr === end;
  }

  /**
   * Check if a date is within the selected range.
   */
  isInRange(dateStr: string): boolean {
    if (this.mode !== "range") return false;

    let start: string | undefined;
    let end: string | undefined;

    if (this.rangeStart && this.hoverDate) {
      // Preview mode during selection
      [start, end] = [this.rangeStart, this.hoverDate].sort();
    } else {
      const parsed = this.parseValue(this.value || "");
      start = parsed.start;
      end = parsed.end;
    }

    if (!start || !end) return false;
    return dateStr >= start && dateStr <= end;
  }

  /**
   * Check if a date is the range start.
   */
  isRangeStart(dateStr: string): boolean {
    if (this.mode !== "range") return false;

    let start: string | undefined;
    let end: string | undefined;

    if (this.rangeStart && this.hoverDate) {
      [start, end] = [this.rangeStart, this.hoverDate].sort();
    } else {
      const parsed = this.parseValue(this.value || "");
      start = parsed.start;
      end = parsed.end;
    }

    return dateStr === start && !!end;
  }

  /**
   * Check if a date is the range end.
   */
  isRangeEnd(dateStr: string): boolean {
    if (this.mode !== "range") return false;

    let start: string | undefined;
    let end: string | undefined;

    if (this.rangeStart && this.hoverDate) {
      [start, end] = [this.rangeStart, this.hoverDate].sort();
    } else {
      const parsed = this.parseValue(this.value || "");
      start = parsed.start;
      end = parsed.end;
    }

    return dateStr === end && !!start;
  }

  /**
   * Check if a date is disabled (outside min/max bounds or in disable list).
   */
  isDateDisabled(dateStr: string): boolean {
    if (this.disabled) return true;
    if (this.min && dateStr < this.min) return true;
    if (this.max && dateStr > this.max) return true;
    if (this.isUnavailable(dateStr)) return true;
    return false;
  }

  /**
   * Parse highlight string into array of {start, end} objects.
   */
  parseHighlight(): Array<{ start: string; end: string }> {
    if (!this.highlight) return [];

    return this.highlight.split(",").map((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("/")) {
        const [start, end] = trimmed.split("/");
        return { start: start!, end: end! };
      }
      return { start: trimmed, end: trimmed };
    });
  }

  /**
   * Check if a date is highlighted.
   */
  isHighlighted(dateStr: string): boolean {
    const highlights = this.parseHighlight();
    return highlights.some(({ start, end }) => dateStr >= start && dateStr <= end);
  }

  /**
   * Check if a date is the start of a highlight range.
   */
  isHighlightStart(dateStr: string): boolean {
    const highlights = this.parseHighlight();
    return highlights.some(({ start, end }) => dateStr === start && start !== end);
  }

  /**
   * Check if a date is the end of a highlight range.
   */
  isHighlightEnd(dateStr: string): boolean {
    const highlights = this.parseHighlight();
    return highlights.some(({ start, end }) => dateStr === end && start !== end);
  }

  /**
   * Parse unavailable string into array of {start, end} objects.
   */
  parseUnavailable(): Array<{ start: string; end: string }> {
    if (!this.unavailable) return [];

    return this.unavailable.split(",").map((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("/")) {
        const [start, end] = trimmed.split("/");
        return { start: start!, end: end! };
      }
      return { start: trimmed, end: trimmed };
    });
  }

  /**
   * Check if a date is unavailable.
   */
  isUnavailable(dateStr: string): boolean {
    const unavailables = this.parseUnavailable();
    return unavailables.some(({ start, end }) => dateStr >= start && dateStr <= end);
  }

  /**
   * Navigate to previous month.
   */
  prevMonth() {
    this.viewDate = new Date(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth() - 1,
      1,
    );
    this.focusedDate = this.formatDate(this.viewDate);
  }

  /**
   * Navigate to next month.
   */
  nextMonth() {
    this.viewDate = new Date(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth() + 1,
      1,
    );
    this.focusedDate = this.formatDate(this.viewDate);
  }

  /**
   * Navigate to today's month.
   */
  goToToday() {
    this.viewDate = new Date();
  }

  /**
   * Navigate to a specific date's month.
   * @param date - Date object or YYYY-MM-DD string
   */
  goToDate(date: Date | string) {
    const d = typeof date === "string" ? this.parseDate(date) : date;
    this.viewDate = new Date(d.getFullYear(), d.getMonth(), 1);
  }

  /**
   * Handle day selection.
   */
  selectDate(dateStr: string) {
    if (this.isDateDisabled(dateStr)) return;

    if (this.mode === "single") {
      this.value = dateStr;
      this.input.value = this.value;
      this.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Range mode
      if (!this.rangeStart) {
        // First click - start range
        this.rangeStart = dateStr;
        this.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        // Second click - complete range
        const [start, end] = [this.rangeStart, dateStr].sort();
        this.value = `${start}/${end}`;
        this.input.value = this.value;
        this.rangeStart = undefined;
        this.hoverDate = undefined;
        this.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  /**
   * Handle day hover for range preview.
   */
  onDayHover(dateStr: string) {
    if (this.mode === "range" && this.rangeStart) {
      this.hoverDate = dateStr;
    }
  }

  /**
   * Move focused date by a number of days.
   */
  moveFocusedDate(days: number) {
    if (!this.focusedDate) {
      this.focusedDate = this.formatDate(new Date());
      return;
    }

    const current = this.parseDate(this.focusedDate);
    current.setDate(current.getDate() + days);
    const newDateStr = this.formatDate(current);

    // Update view if we've moved outside current month
    if (
      current.getMonth() !== this.viewDate.getMonth() ||
      current.getFullYear() !== this.viewDate.getFullYear()
    ) {
      this.viewDate = new Date(current.getFullYear(), current.getMonth(), 1);
    }

    this.focusedDate = newDateStr;

    // Update hover preview during range selection
    if (this.mode === "range" && this.rangeStart) {
      this.hoverDate = newDateStr;
    }
  }

  /**
   * Handle keyboard navigation.
   */
  onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        this.moveFocusedDate(-1);
        e.preventDefault();
        break;
      case "ArrowRight":
        this.moveFocusedDate(1);
        e.preventDefault();
        break;
      case "ArrowUp":
        this.moveFocusedDate(-7);
        e.preventDefault();
        break;
      case "ArrowDown":
        this.moveFocusedDate(7);
        e.preventDefault();
        break;
      case "Enter":
      case " ":
        if (this.focusedDate) {
          this.selectDate(this.focusedDate);
          e.preventDefault();
        }
        break;
      case "PageUp":
        this.prevMonth();
        e.preventDefault();
        break;
      case "PageDown":
        this.nextMonth();
        e.preventDefault();
        break;
      case "Escape":
        if (this.rangeStart) {
          this.rangeStart = undefined;
          this.hoverDate = undefined;
        }
        break;
    }
  };

  render() {
    const weekdays = this.getWeekdayNames();
    const days = this.getDaysInView();

    return html`
      <div class="header" part="header">
        <button
          type="button"
          class="nav-btn"
          part="nav-btn prev"
          tabindex="-1"
          @click=${this.prevMonth}
          ?disabled=${this.disabled}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span class="header-title" part="title">${this.getMonthYearString()}</span>
        <button
          type="button"
          class="nav-btn"
          part="nav-btn next"
          tabindex="-1"
          @click=${this.nextMonth}
          ?disabled=${this.disabled}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div class="weekdays" part="weekdays">
        ${weekdays.map((name) => html`<span class="weekday">${name}</span>`)}
      </div>

      <div class="days" part="days" role="grid">
        ${days.map(({ dateStr, isOtherMonth }) => {
          const disabled = this.isDateDisabled(dateStr);
          const selected = this.isSelected(dateStr);
          const inRange = this.isInRange(dateStr);
          const rangeStart = this.isRangeStart(dateStr);
          const rangeEnd = this.isRangeEnd(dateStr);
          const today = this.isToday(dateStr);
          const focused = this.focusedDate === dateStr;
          const highlighted = this.isHighlighted(dateStr);
          const highlightStart = this.isHighlightStart(dateStr);
          const highlightEnd = this.isHighlightEnd(dateStr);
          const dayNum = parseInt(dateStr.split("-")[2]!, 10);

          return html`
            <button
              type="button"
              class="day"
              part="day"
              role="gridcell"
              tabindex="-1"
              ?disabled=${disabled}
              ?data-other-month=${isOtherMonth}
              ?data-today=${today}
              ?data-selected=${selected}
              ?data-in-range=${inRange}
              ?data-range-start=${rangeStart}
              ?data-range-end=${rangeEnd}
              ?data-focused=${focused}
              ?data-highlighted=${highlighted}
              ?data-highlight-start=${highlightStart}
              ?data-highlight-end=${highlightEnd}
              aria-selected=${selected ? "true" : "false"}
              aria-label=${dateStr}
              @click=${() => this.selectDate(dateStr)}
              @mouseenter=${() => this.onDayHover(dateStr)}
            >
              ${dayNum}
            </button>
          `;
        })}
      </div>

      ${
        this.rangeStart
          ? html`<div part="hint" style="font-size: 0.75rem; opacity: 0.6; margin-top: 0.5rem; text-align: center;">
            Select end date
          </div>`
          : nothing
      }
    `;
  }
}

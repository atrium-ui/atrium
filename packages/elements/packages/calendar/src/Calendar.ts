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
 * @example Date range with initial view on end date
 * ```html
 * <a-calendar mode="range" value="2024-03-15/2024-05-20" range-focus="end"></a-calendar>
 * ```
 *
 * @example Custom locale and week start
 * ```html
 * <a-calendar locale="de-DE" week-start="1"></a-calendar>
 * ```
 */
export class CalendarElement extends LitElement {
  // Delegate focus so the host is always a valid focus target
  // (`calendar.focus()`, click, sequential tab) while the actual focus lands
  // on a focusable element inside the shadow root. This keeps a fallback
  // "focus the calendar" target without making a screen reader read the
  // accessible name of the entire subtree (every button) at once.
  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

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
      --_focus-outline: var(--calendar-focus-outline, black);
      --_bg: var(--calendar-bg, Canvas);
    }

    .body {
      position: relative;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .header-title {
      font-weight: 600;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      border: none;
      background: none;
      color: inherit;
      font-size: inherit;
    }

    .header-title:hover {
      background: var(--_hover-bg);
    }

    .nav-buttons {
      display: flex;
      gap: 0.25rem;
    }

    /* Overlay the calendar body so toggling the picker does not change the
       element's dimensions. The day grid stays in flow and governs size. */
    .year-picker {
      position: absolute;
      inset: 0;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      align-content: start;
      gap: 0.25rem;
      overflow-y: auto;
      background: var(--_bg);
    }

    .year-option {
      padding: 1rem;
      text-align: center;
      cursor: pointer;
      border-radius: 0.25rem;
      border: none;
      background: none;
      color: inherit;
      font-size: 1rem;
    }

    .year-option:hover {
      background: var(--_hover-bg);
    }

    .year-option[data-selected] {
      background: var(--_selected-bg);
      color: var(--_selected-color);
    }

    .year-option[data-focused] {
      outline: 2px solid var(--_focus-outline);
      outline-offset: -2px;
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
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    /* Real row boxes (not display:contents): some browsers drop the ARIA
       role of a display:contents element, which breaks the grid structure
       and makes screen readers read the whole row of cells at once. */
    .week {
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
      outline: 1px solid var(--_selected-bg);
      border-radius: 0.25rem 0 0 0.25rem;
    }

    .day[data-range-end] {
      outline: 1px solid var(--_selected-bg);
      border-radius: 0 0.25rem 0.25rem 0;
    }

    .day[data-range-start][data-range-end] {
      border-radius: 0.25rem;
    }

    .day[disabled] {
      opacity: 0.3;
      cursor: not-allowed;
    }

    /* Roving tabindex: the focused day cell holds DOM focus directly. Show a
       ring only for keyboard focus, not when clicked with a pointer. */
    .day:focus-visible {
      outline: 2px solid var(--_focus-outline);
      outline-offset: -2px;
    }

    .day:focus:not(:focus-visible) {
      outline: none;
    }

    .year-picker:focus {
      outline: none;
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

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;

  /**
   * FormData name of the field.
   */
  @property({ type: String })
  accessor name: string | undefined = undefined;

  /**
   * The value of the field.
   * Single mode: "YYYY-MM-DD"
   * Range mode: "YYYY-MM-DD/YYYY-MM-DD"
   */
  @property({ type: String, reflect: true })
  accessor value: string | undefined = undefined;

  /**
   * Selection mode: "single" for single date, "range" for date range.
   */
  @property({ type: String, reflect: true })
  accessor mode: "single" | "range" = "single";

  /**
   * BCP 47 locale tag for month/day names.
   */
  @property({ type: String })
  accessor locale: string = navigator.language;

  /**
   * First day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
   * Defaults to locale-appropriate value.
   */
  @property({ type: Number, attribute: "week-start" })
  accessor weekStart: number | undefined = undefined;

  /**
   * Minimum selectable date (YYYY-MM-DD).
   */
  @property({ type: String })
  accessor min: string | undefined = undefined;

  /**
   * Maximum selectable date (YYYY-MM-DD).
   */
  @property({ type: String })
  accessor max: string | undefined = undefined;

  /**
   * Dates or ranges to highlight visually.
   * Comma-separated list of dates (YYYY-MM-DD) or ranges (YYYY-MM-DD/YYYY-MM-DD).
   * @example "2024-03-15" - single date
   * @example "2024-03-15/2024-03-20" - date range
   * @example "2024-03-15,2024-03-20/2024-03-25,2024-04-01" - multiple
   */
  @property({ type: String })
  accessor highlight: string | undefined = undefined;

  /**
   * Dates or ranges to mark as unavailable.
   * Comma-separated list of dates (YYYY-MM-DD) or ranges (YYYY-MM-DD/YYYY-MM-DD).
   * @example "2024-03-15" - single date
   * @example "2024-03-15/2024-03-20" - date range
   * @example "2024-03-15,2024-03-20/2024-03-25,2024-04-01" - multiple
   */
  @property({ type: String })
  accessor unavailable: string | undefined = undefined;

  /**
   * Whether the calendar is disabled.
   */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  /**
   * Which date of a range to focus for initial view month.
   * Only applies when mode="range" and a value is provided.
   * @default "start"
   */
  @property({ type: String, attribute: "range-focus" })
  accessor rangeFocus: "start" | "end" = "start";

  /**
   * Currently displayed month/year for navigation.
   */
  @state()
  accessor viewDate: Date = new Date();

  /**
   * Whether the year picker menu is open.
   */
  @state()
  accessor yearPickerOpen = false;

  /**
   * Currently focused year for keyboard navigation in year picker.
   */
  @state()
  accessor focusedYear: number | undefined = undefined;

  /**
   * Temporary range start during range selection.
   */
  @state()
  accessor rangeStart: string | undefined = undefined;

  /**
   * Hovered date for range preview.
   */
  @state()
  accessor hoverDate: string | undefined = undefined;

  /**
   * Currently focused date for keyboard navigation.
   */
  @state()
  accessor focusedDate: string | undefined = undefined;

  /**
   * Message announced to screen readers via the live region.
   * Updated on navigation and selection so assistive tech gets feedback.
   */
  @state()
  accessor announcement: string = "";

  input = document.createElement("input");

  connectedCallback() {
    super.connectedCallback();
    // The host itself is not focusable: a focusable host with no role makes
    // screen readers announce the accessible name of the whole subtree (every
    // button label) at once. Focus lives on the inner grid / year listbox
    // instead, which expose proper roles and drive aria-activedescendant.

    if (this.value) {
      const parsed = this.parseValue(this.value);
      const focusDate =
        this.rangeFocus === "end" && parsed.end ? parsed.end : parsed.start;
      if (focusDate) {
        this.viewDate = this.parseDate(focusDate);
        this.focusedDate = focusDate;
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
   * Format a date string as a localized, human-readable label
   * (e.g. "Friday, March 15, 2024") for screen readers.
   */
  formatDateLong(dateStr: string): string {
    const formatter = new Intl.DateTimeFormat(this.locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatter.format(this.parseDate(dateStr));
  }

  /**
   * Build an accessible label for a day cell: the localized date plus any
   * relevant state (today, selected, range bounds, unavailable) so screen
   * reader users get full context as they navigate.
   */
  describeDate(dateStr: string): string {
    const parts = [this.formatDateLong(dateStr)];
    if (this.isToday(dateStr)) parts.push("Today");
    if (this.isRangeStart(dateStr)) parts.push("Range start");
    if (this.isRangeEnd(dateStr)) parts.push("Range end");
    if (this.isSelected(dateStr) && !this.isRangeStart(dateStr) && !this.isRangeEnd(dateStr)) {
      parts.push("Selected");
    }
    if (this.isDateDisabled(dateStr)) parts.push("Unavailable");
    return parts.join(", ");
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
    // When actively selecting a new range, don't show old selection
    if (this.mode === "range" && this.rangeStart) {
      return dateStr === this.rangeStart;
    }

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

    if (this.rangeStart) {
      // Actively selecting - only show preview range if hovering
      if (!this.hoverDate) return false;
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
    // The moved active cell is announced via aria-activedescendant.
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
    // The moved active cell is announced via aria-activedescendant.
  }

  /**
   * Navigate to today's month.
   */
  goToToday() {
    this.viewDate = new Date();
  }

  /**
   * Focus the calendar's active control — the focused day cell (roving
   * tabindex), or the year listbox while the year picker is open. Overrides
   * the default so an external `calendar.focus()` reliably lands on the
   * meaningful control rather than delegating to the first focusable
   * descendant (the title button).
   */
  override focus(options?: FocusOptions) {
    const selector = this.yearPickerOpen
      ? ".year-picker"
      : `[data-date="${this.focusedDate}"]`;
    const target = this.shadowRoot?.querySelector<HTMLElement>(selector);
    if (target) {
      target.focus(options);
    } else {
      super.focus(options);
    }
  }

  /**
   * Move DOM focus to the currently focused day cell (after the next render).
   * With roving tabindex this is the single tabbable cell in the grid, so a
   * screen reader announces just that cell — not the whole row.
   */
  focusActiveDay() {
    this.updateComplete.then(() => {
      // preventScroll: focusing must not scroll the page to the calendar.
      this.shadowRoot
        ?.querySelector<HTMLElement>(`[data-date="${this.focusedDate}"]`)
        ?.focus({ preventScroll: true });
    });
  }

  /**
   * Move keyboard focus to the year listbox (after the next render).
   */
  focusYearPicker() {
    this.updateComplete.then(() => {
      // preventScroll: focusing must not scroll the page to the calendar.
      this.shadowRoot?.querySelector<HTMLElement>(".year-picker")?.focus({
        preventScroll: true,
      });
    });
  }

  /**
   * Scroll a year option into view *within the picker only*.
   * Element.scrollIntoView scrolls every scrollable ancestor (including the
   * document), which would jump the whole page when the picker opens — so we
   * adjust the picker's own scrollTop instead.
   */
  scrollYearIntoView(option: HTMLElement | null | undefined, center: boolean) {
    const picker = this.shadowRoot?.querySelector<HTMLElement>(".year-picker");
    if (!picker || !option) return;

    if (center) {
      picker.scrollTop =
        option.offsetTop - picker.clientHeight / 2 + option.clientHeight / 2;
      return;
    }

    // "nearest": only scroll when the option is outside the visible area.
    const top = option.offsetTop;
    const bottom = top + option.clientHeight;
    if (top < picker.scrollTop) {
      picker.scrollTop = top;
    } else if (bottom > picker.scrollTop + picker.clientHeight) {
      picker.scrollTop = bottom - picker.clientHeight;
    }
  }

  toggleYearPicker(ev: Event) {
    this.yearPickerOpen = !this.yearPickerOpen;
    this.focusedYear = this.yearPickerOpen ? this.viewDate.getFullYear() : undefined;
    ev.stopPropagation();
    if (this.yearPickerOpen) {
      this.focusYearPicker();
      this.updateComplete.then(() => {
        const selected = this.shadowRoot?.querySelector<HTMLElement>(
          ".year-option[data-selected]",
        );
        this.scrollYearIntoView(selected, true);
      });
    } else {
      this.focusActiveDay();
    }
  }

  selectYear(year: number) {
    const newDate = new Date(this.viewDate);
    newDate.setFullYear(year);
    this.viewDate = newDate;
    this.focusedDate = this.formatDate(new Date(year, newDate.getMonth(), 1));
    this.yearPickerOpen = false;
    this.focusedYear = undefined;
    this.announce(this.getMonthYearString());
    this.focusActiveDay();
  }

  getYearOptions(): number[] {
    const minYear = this.min ? parseInt(this.min.split("-")[0]!, 10) : 1900;
    const maxYear = this.max ? parseInt(this.max.split("-")[0]!, 10) : 2100;
    const years: number[] = [];
    for (let y = minYear; y <= maxYear; y++) {
      years.push(y);
    }
    return years;
  }

  moveFocusedYear(delta: number) {
    if (this.focusedYear === undefined) {
      this.focusedYear = this.viewDate.getFullYear();
      return;
    }
    const years = this.getYearOptions();
    const currentIndex = years.indexOf(this.focusedYear);
    const newIndex = Math.max(0, Math.min(years.length - 1, currentIndex + delta));
    this.focusedYear = years[newIndex]!;
    this.updateComplete.then(() => {
      const focused = this.shadowRoot?.querySelector<HTMLElement>(
        ".year-option[data-focused]",
      );
      this.scrollYearIntoView(focused, false);
    });
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
      this.announce(`Selected ${this.formatDateLong(dateStr)}`);
      this.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Range mode
      if (!this.rangeStart) {
        // First click - start range
        this.rangeStart = dateStr;
        this.announce(
          `Range start ${this.formatDateLong(dateStr)}. Select end date.`,
        );
        this.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        // Second click - complete range
        const [start, end] = [this.rangeStart, dateStr].sort();
        this.value = `${start}/${end}`;
        this.input.value = this.value;
        this.rangeStart = undefined;
        this.hoverDate = undefined;
        this.announce(
          `Selected range ${this.formatDateLong(start!)} to ${this.formatDateLong(end!)}`,
        );
        this.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  /**
   * Update the screen reader live region. Resets first so identical
   * consecutive messages are still re-announced by assistive tech.
   */
  announce(message: string) {
    this.announcement = "";
    this.updateComplete.then(() => {
      this.announcement = message;
    });
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

    // Move real DOM focus to the new cell (roving tabindex). No live-region
    // announcement needed: focusing the cell makes assistive tech read it,
    // and its accessible name already carries the full date and its state.
    this.focusActiveDay();
  }

  /**
   * Handle keyboard navigation.
   */
  onKeyDown = (e: KeyboardEvent) => {
    if (this.yearPickerOpen) {
      switch (e.key) {
        case "ArrowLeft":
          this.moveFocusedYear(-1);
          e.preventDefault();
          break;
        case "ArrowRight":
          this.moveFocusedYear(1);
          e.preventDefault();
          break;
        case "ArrowUp":
          this.moveFocusedYear(-3);
          e.preventDefault();
          break;
        case "ArrowDown":
          this.moveFocusedYear(3);
          e.preventDefault();
          break;
        case "Enter":
        case " ":
          if (this.focusedYear !== undefined) {
            this.selectYear(this.focusedYear);
            e.preventDefault();
          }
          break;
        case "Escape":
          this.yearPickerOpen = false;
          this.focusedYear = undefined;
          this.focusActiveDay();
          e.preventDefault();
          e.stopPropagation();
          break;
      }
      return;
    } else {
      const target = e.composedPath()[0] as HTMLElement;
      if (
        target.classList.contains("header-title") &&
        (e.key === "Enter" || e.key === " ")
      ) {
        // Let the button's native click toggle the year picker (which moves
        // focus to the listbox). Stop here so Enter/Space isn't also treated
        // as a date selection by the grid handler below.
        return;
      }
    }

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
        this.focusActiveDay();
        e.preventDefault();
        break;
      case "PageDown":
        this.nextMonth();
        this.focusActiveDay();
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
    const currentYear = this.viewDate.getFullYear();
    const weekdays = this.getWeekdayNames();
    const days = this.getDaysInView();

    // Group days into weeks so the grid has proper row semantics.
    const weeks: Array<typeof days> = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return html`
      <div class="header" part="header">
        <button
          type="button"
          class="header-title"
          part="title"
          @click=${this.toggleYearPicker}
          ?disabled=${this.disabled}
          aria-label=${this.yearPickerOpen ? "Back to calendar" : "Select year"}
        >
          ${this.yearPickerOpen ? currentYear : this.getMonthYearString()}
        </button>
        ${
          this.yearPickerOpen
            ? nothing
            : html`
              <div class="nav-buttons">
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
            `
        }
      </div>

      <div class="body" part="body">
        <div class="weekdays" part="weekdays" aria-hidden="true">
          ${weekdays.map((name) => html`<span class="weekday">${name}</span>`)}
        </div>

        <div
          class="days"
          part="days"
          role="group"
          aria-hidden=${this.yearPickerOpen ? "true" : nothing}
          aria-label=${this.getMonthYearString()}
        >
              ${weeks.map(
                (week) => html`
                  <div class="week" part="week">
                    ${week.map(({ dateStr, isOtherMonth }) => {
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
                          id="day-${dateStr}"
                          class="day"
                          part="day"
                          tabindex=${focused && !this.yearPickerOpen ? "0" : "-1"}
                          data-date=${dateStr}
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
                          aria-current=${today ? "date" : nothing}
                          aria-disabled=${disabled ? "true" : nothing}
                          aria-label=${this.describeDate(dateStr)}
                          @click=${() => this.selectDate(dateStr)}
                          @mouseenter=${() => this.onDayHover(dateStr)}
                        >
                          <span aria-hidden="true">${dayNum}</span>
                        </button>
                      `;
                    })}
                  </div>
                `,
              )}
            </div>

        ${
          this.rangeStart && !this.yearPickerOpen
            ? html`<div part="hint" style="font-size: 0.75rem; opacity: 0.6; margin-top: 0.5rem; text-align: center;">
              Select end date
            </div>`
            : nothing
        }

        ${
          this.yearPickerOpen
            ? html`
              <div
                class="year-picker"
                part="year-picker"
                role="listbox"
                tabindex="0"
                aria-label="Select year"
                aria-activedescendant=${this.focusedYear ? `year-${this.focusedYear}` : nothing}
              >
                ${this.getYearOptions().map(
                  (year) => html`
                    <button
                      type="button"
                      id="year-${year}"
                      class="year-option"
                      role="option"
                      tabindex="-1"
                      aria-selected=${year === currentYear ? "true" : "false"}
                      ?data-selected=${year === currentYear}
                      ?data-focused=${year === this.focusedYear}
                      @click=${() => this.selectYear(year)}
                    >
                      ${year}
                    </button>
                  `,
                )}
              </div>
            `
            : nothing
        }
      </div>

      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        ${this.announcement}
      </div>
    `;
  }
}

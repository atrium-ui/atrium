import { beforeEach, afterEach, test, expect, describe } from "bun:test";
import { within } from "@testing-library/dom";
import { computeAccessibleName } from "dom-accessibility-api";

const NODE_NAME = "a-calendar";

// Helper to create a calendar element
async function newCalendar(
  options: {
    value?: string;
    mode?: "single" | "range";
    locale?: string;
    weekStart?: number;
    min?: string;
    max?: string;
    disabled?: boolean;
    name?: string;
  } = {},
) {
  const attrs: string[] = [];
  if (options.value) attrs.push(`value="${options.value}"`);
  if (options.mode) attrs.push(`mode="${options.mode}"`);
  if (options.locale) attrs.push(`locale="${options.locale}"`);
  if (options.weekStart !== undefined) attrs.push(`week-start="${options.weekStart}"`);
  if (options.min) attrs.push(`min="${options.min}"`);
  if (options.max) attrs.push(`max="${options.max}"`);
  if (options.disabled) attrs.push("disabled");
  if (options.name) attrs.push(`name="${options.name}"`);

  const ele = document.createElement("div");
  ele.innerHTML = `<a-calendar ${attrs.join(" ")}></a-calendar>`;
  document.body.append(ele);

  const calendar = ele.querySelector("a-calendar")!;
  await calendar.updateComplete;
  return { root: ele, calendar };
}

function cleanup(root: HTMLElement) {
  root.remove();
}

function clickDay(calendar: any, dateStr: string) {
  const dayBtn = calendar.shadowRoot?.querySelector(`[data-date="${dateStr}"]`);
  if (!dayBtn) throw new Error(`Day button not found for ${dateStr}`);
  dayBtn.click();
}

function getDayButton(calendar: any, dateStr: string) {
  return calendar.shadowRoot?.querySelector(`[data-date="${dateStr}"]`);
}

// Import and registration tests
test("import a-calendar element", async () => {
  const { CalendarElement } = await import("../dist/index.js");
  expect(CalendarElement).toBeDefined();
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-calendar element", async () => {
  const { CalendarElement } = await import("../dist/index.js");

  expect(new CalendarElement()).toBeInstanceOf(CalendarElement);

  const ele = document.createElement("div");
  ele.innerHTML = `<${NODE_NAME} />`;
  expect(ele.children[0]).toBeInstanceOf(CalendarElement);
});

// Date formatting tests
describe("date formatting", () => {
  test("formatDate returns YYYY-MM-DD", async () => {
    const { root, calendar } = await newCalendar();

    expect(calendar.formatDate(new Date(2024, 2, 15))).toBe("2024-03-15");
    expect(calendar.formatDate(new Date(2024, 0, 1))).toBe("2024-01-01");
    expect(calendar.formatDate(new Date(2024, 11, 31))).toBe("2024-12-31");

    cleanup(root);
  });

  test("parseDate creates correct Date object", async () => {
    const { root, calendar } = await newCalendar();

    const date = calendar.parseDate("2024-03-15");
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(2); // 0-indexed
    expect(date.getDate()).toBe(15);

    cleanup(root);
  });

  test("parseValue handles single date", async () => {
    const { root, calendar } = await newCalendar();

    const result = calendar.parseValue("2024-03-15");
    expect(result.start).toBe("2024-03-15");
    expect(result.end).toBeUndefined();

    cleanup(root);
  });

  test("parseValue handles date range", async () => {
    const { root, calendar } = await newCalendar({ mode: "range" });

    const result = calendar.parseValue("2024-03-10/2024-03-20");
    expect(result.start).toBe("2024-03-10");
    expect(result.end).toBe("2024-03-20");

    cleanup(root);
  });
});

// Single date selection tests
describe("single date selection", () => {
  test("initial value is set", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    expect(calendar.value).toBe("2024-03-15");

    cleanup(root);
  });

  test("clicking a day selects it", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    clickDay(calendar, "2024-03-20");
    expect(calendar.value).toBe("2024-03-20");

    cleanup(root);
  });

  test("change event fires on selection", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    let changeEvent = false;
    calendar.addEventListener("change", () => {
      changeEvent = true;
    });

    clickDay(calendar, "2024-03-20");
    expect(changeEvent).toBe(true);

    cleanup(root);
  });
});

// Range selection tests
describe("range selection", () => {
  test("initial range value is set", async () => {
    const { root, calendar } = await newCalendar({
      mode: "range",
      value: "2024-03-10/2024-03-20",
    });

    expect(calendar.value).toBe("2024-03-10/2024-03-20");

    cleanup(root);
  });

  test("clicking two dates creates range", async () => {
    const { root, calendar } = await newCalendar({ mode: "range", value: "2024-03-15" });

    clickDay(calendar, "2024-03-10");
    expect(calendar.rangeStart).toBe("2024-03-10");

    clickDay(calendar, "2024-03-20");
    expect(calendar.value).toBe("2024-03-10/2024-03-20");
    expect(calendar.rangeStart).toBeUndefined();

    cleanup(root);
  });

  test("range is sorted correctly when end is before start", async () => {
    const { root, calendar } = await newCalendar({ mode: "range", value: "2024-03-15" });

    clickDay(calendar, "2024-03-20");
    clickDay(calendar, "2024-03-10");
    expect(calendar.value).toBe("2024-03-10/2024-03-20");

    cleanup(root);
  });

  test("input event fires on first click, change on second", async () => {
    const { root, calendar } = await newCalendar({ mode: "range", value: "2024-03-15" });

    let inputFired = false;
    let changeFired = false;

    calendar.addEventListener("input", () => {
      inputFired = true;
    });
    calendar.addEventListener("change", () => {
      changeFired = true;
    });

    clickDay(calendar, "2024-03-10");
    expect(inputFired).toBe(true);
    expect(changeFired).toBe(false);

    clickDay(calendar, "2024-03-20");
    expect(changeFired).toBe(true);

    cleanup(root);
  });

  test("escape cancels range selection", async () => {
    const { root, calendar } = await newCalendar({ mode: "range", value: "2024-03-15" });

    clickDay(calendar, "2024-03-10");
    expect(calendar.rangeStart).toBe("2024-03-10");

    calendar.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(calendar.rangeStart).toBeUndefined();

    cleanup(root);
  });
});

// Navigation tests
describe("navigation", () => {
  test("prevMonth navigates to previous month", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    calendar.prevMonth();
    expect(calendar.viewDate.getMonth()).toBe(1); // February

    cleanup(root);
  });

  test("nextMonth navigates to next month", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    calendar.nextMonth();
    expect(calendar.viewDate.getMonth()).toBe(3); // April

    cleanup(root);
  });

  test("goToToday navigates to current month", async () => {
    const { root, calendar } = await newCalendar({ value: "2020-01-15" });

    calendar.goToToday();
    const now = new Date();
    expect(calendar.viewDate.getFullYear()).toBe(now.getFullYear());
    expect(calendar.viewDate.getMonth()).toBe(now.getMonth());

    cleanup(root);
  });

  test("goToDate navigates to specific date", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    calendar.goToDate("2025-12-25");
    expect(calendar.viewDate.getFullYear()).toBe(2025);
    expect(calendar.viewDate.getMonth()).toBe(11); // December

    cleanup(root);
  });

  test("goToDate accepts Date object", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    calendar.goToDate(new Date(2025, 5, 15));
    expect(calendar.viewDate.getFullYear()).toBe(2025);
    expect(calendar.viewDate.getMonth()).toBe(5); // June

    cleanup(root);
  });
});

// Week start tests
describe("week start configuration", () => {
  test("week-start attribute sets first day", async () => {
    const { root, calendar } = await newCalendar({ weekStart: 1 });

    expect(calendar.effectiveWeekStart).toBe(1); // Monday

    cleanup(root);
  });

  test("US locale defaults to Sunday start", async () => {
    const { root, calendar } = await newCalendar({ locale: "en-US" });

    expect(calendar.effectiveWeekStart).toBe(0); // Sunday

    cleanup(root);
  });

  test("German locale defaults to Monday start", async () => {
    const { root, calendar } = await newCalendar({ locale: "de-DE" });

    expect(calendar.effectiveWeekStart).toBe(1); // Monday

    cleanup(root);
  });

  test("explicit week-start overrides locale default", async () => {
    const { root, calendar } = await newCalendar({ locale: "en-US", weekStart: 1 });

    expect(calendar.effectiveWeekStart).toBe(1); // Monday despite US locale

    cleanup(root);
  });
});

// Min/max constraints tests
describe("min/max constraints", () => {
  test("dates before min are disabled", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      min: "2024-03-10",
    });

    expect(calendar.isDateDisabled("2024-03-09")).toBe(true);
    expect(calendar.isDateDisabled("2024-03-10")).toBe(false);
    expect(calendar.isDateDisabled("2024-03-15")).toBe(false);

    cleanup(root);
  });

  test("dates after max are disabled", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      max: "2024-03-20",
    });

    expect(calendar.isDateDisabled("2024-03-20")).toBe(false);
    expect(calendar.isDateDisabled("2024-03-21")).toBe(true);
    expect(calendar.isDateDisabled("2024-03-15")).toBe(false);

    cleanup(root);
  });

  test("clicking disabled date does nothing", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      min: "2024-03-10",
    });

    clickDay(calendar, "2024-03-05");
    expect(calendar.value).toBe("2024-03-15"); // unchanged

    cleanup(root);
  });
});

// Disabled state tests
describe("disabled state", () => {
  test("all dates are disabled when calendar is disabled", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      disabled: true,
    });

    expect(calendar.isDateDisabled("2024-03-15")).toBe(true);
    expect(calendar.isDateDisabled("2024-03-20")).toBe(true);

    cleanup(root);
  });

  test("clicking dates when disabled does nothing", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      disabled: true,
    });

    clickDay(calendar, "2024-03-20");
    expect(calendar.value).toBe("2024-03-15"); // unchanged

    cleanup(root);
  });
});

// Form integration tests
describe("form integration", () => {
  test("hidden input is created with name attribute", async () => {
    const { root, calendar } = await newCalendar({
      name: "test-date",
      value: "2024-03-15",
    });

    const hiddenInput = calendar.querySelector(
      'input[type="hidden"]',
    ) as HTMLInputElement;
    expect(hiddenInput).toBeDefined();
    expect(hiddenInput.name).toBe("test-date");
    expect(hiddenInput.value).toBe("2024-03-15");

    cleanup(root);
  });

  test("form data includes calendar value", async () => {
    const { root, calendar } = await newCalendar({
      name: "booking-date",
      value: "2024-03-15",
    });

    const form = document.createElement("form");
    form.append(root);
    document.body.append(form);

    const formData = new FormData(form);
    expect(formData.get("booking-date")).toBe("2024-03-15");

    form.remove();
  });

  test("form data updates when selection changes", async () => {
    const { root, calendar } = await newCalendar({
      name: "booking-date",
      value: "2024-03-15",
    });

    const form = document.createElement("form");
    form.append(root);
    document.body.append(form);

    clickDay(calendar, "2024-03-20");

    const formData = new FormData(form);
    expect(formData.get("booking-date")).toBe("2024-03-20");

    form.remove();
  });
});

// Leap year tests
describe("leap year handling", () => {
  test("February 2024 has 29 days (leap year)", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-02-15" });

    const days = calendar.getDaysInView();
    const febDays = days.filter(
      (d) => !d.isOtherMonth && d.dateStr.startsWith("2024-02"),
    );

    expect(febDays.length).toBe(29);
    expect(febDays.some((d) => d.dateStr === "2024-02-29")).toBe(true);

    cleanup(root);
  });

  test("February 2023 has 28 days (non-leap year)", async () => {
    const { root, calendar } = await newCalendar({ value: "2023-02-15" });

    const days = calendar.getDaysInView();
    const febDays = days.filter(
      (d) => !d.isOtherMonth && d.dateStr.startsWith("2023-02"),
    );

    expect(febDays.length).toBe(28);
    expect(febDays.some((d) => d.dateStr === "2023-02-29")).toBe(false);

    cleanup(root);
  });
});

// Today detection tests
describe("today detection", () => {
  test("isToday returns true for current date", async () => {
    const { root, calendar } = await newCalendar();

    const today = calendar.formatDate(new Date());
    expect(calendar.isToday(today)).toBe(true);
    expect(calendar.isToday("2020-01-01")).toBe(false);

    cleanup(root);
  });
});

// Locale tests
describe("locale support", () => {
  test("getWeekdayNames returns localized names", async () => {
    const { root, calendar } = await newCalendar({ locale: "en-US", weekStart: 0 });

    const weekdays = calendar.getWeekdayNames();
    expect(weekdays.length).toBe(7);
    expect(weekdays[0]).toBe("Sun");

    cleanup(root);
  });

  test("getMonthYearString returns localized string", async () => {
    const { root, calendar } = await newCalendar({
      locale: "de-DE",
      value: "2024-03-15",
    });

    const monthYear = calendar.getMonthYearString();
    expect(monthYear).toContain("2024");
    expect(monthYear).toContain("März");

    cleanup(root);
  });
});

// Selection state tests
describe("selection state", () => {
  test("isSelected returns true for selected date", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    expect(calendar.isSelected("2024-03-15")).toBe(true);
    expect(calendar.isSelected("2024-03-16")).toBe(false);

    cleanup(root);
  });

  test("isInRange returns true for dates in range", async () => {
    const { root, calendar } = await newCalendar({
      mode: "range",
      value: "2024-03-10/2024-03-20",
    });

    expect(calendar.isInRange("2024-03-09")).toBe(false);
    expect(calendar.isInRange("2024-03-10")).toBe(true);
    expect(calendar.isInRange("2024-03-15")).toBe(true);
    expect(calendar.isInRange("2024-03-20")).toBe(true);
    expect(calendar.isInRange("2024-03-21")).toBe(false);

    cleanup(root);
  });

  test("isRangeStart and isRangeEnd identify boundaries", async () => {
    const { root, calendar } = await newCalendar({
      mode: "range",
      value: "2024-03-10/2024-03-20",
    });

    expect(calendar.isRangeStart("2024-03-10")).toBe(true);
    expect(calendar.isRangeStart("2024-03-15")).toBe(false);
    expect(calendar.isRangeEnd("2024-03-20")).toBe(true);
    expect(calendar.isRangeEnd("2024-03-15")).toBe(false);

    cleanup(root);
  });
});

// Accessibility tests — assert against the computed accessibility tree
// (roles + accessible names) via Testing Library rather than raw markup.
describe("accessibility", () => {
  // Scope Testing Library queries to the component's shadow root.
  function a11y(calendar: any) {
    return within(calendar.shadowRoot as unknown as HTMLElement);
  }

  // The polite live region is exposed as role="status".
  async function liveText(calendar: any) {
    // announce() clears then sets the message on the next update tick.
    await calendar.updateComplete;
    await calendar.updateComplete;
    return a11y(calendar).getByRole("status").textContent?.trim();
  }

  // The day collection avoids grid/row/gridcell roles on purpose: a row's
  // accessible name is the concatenation of its cells, so screen readers
  // (VoiceOver) read the whole week when a cell is focused. A labelled group
  // of plain buttons keeps each day's announcement isolated.
  test("days are exposed as a labelled group, not a grid", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      locale: "en-US",
    });

    const sr = a11y(calendar);
    expect(sr.getByRole("group", { name: "March 2024" })).toBeTruthy();
    // No grid/row/gridcell roles anywhere in the day collection.
    expect(sr.queryAllByRole("grid").length).toBe(0);
    expect(sr.queryAllByRole("row").length).toBe(0);
    expect(sr.queryAllByRole("gridcell").length).toBe(0);

    cleanup(root);
  });

  test("no week wrapper exposes the concatenation of its days as a name", async () => {
    const { root, calendar } = await newCalendar({
      value: "1967-03-15",
      locale: "en-US",
    });

    // Reproduces the original bug: a role="row" wrapper computed its
    // accessible name from all 7 day labels, so VoiceOver read the entire
    // week ("…row Sunday March 12, Monday March 13, …") on cell focus.
    const weeks = calendar.shadowRoot.querySelectorAll(".week");
    expect(weeks.length).toBe(6);
    for (const week of weeks) {
      expect(computeAccessibleName(week as HTMLElement)).toBe("");
    }

    cleanup(root);
  });

  test("each day is reachable by its human-readable accessible name", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      locale: "en-US",
    });

    // The accessible name a screen reader would announce, not the ISO string.
    const day = a11y(calendar).getByRole("button", {
      name: /Friday, March 15, 2024/,
    });
    expect(day.getAttribute("data-date")).toBe("2024-03-15");

    cleanup(root);
  });

  test("a day's accessible name carries its selection state", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      locale: "en-US",
    });

    // Selection is conveyed in the label (no aria-selected, which is invalid
    // on a plain button anyway).
    const day = a11y(calendar).getByRole("button", { name: /Selected/ });
    expect(day.getAttribute("data-date")).toBe("2024-03-15");
    expect(computeAccessibleName(day)).toContain("Selected");

    cleanup(root);
  });

  test("today's cell exposes aria-current=date in its accessible name", async () => {
    const { root, calendar } = await newCalendar();

    const todayStr = calendar.formatDate(new Date());
    const day = a11y(calendar).getByRole("button", { name: /Today/ });
    expect(day.getAttribute("data-date")).toBe(todayStr);
    expect(day.getAttribute("aria-current")).toBe("date");

    cleanup(root);
  });

  test("selecting a date announces it via the live region", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      locale: "en-US",
    });

    clickDay(calendar, "2024-03-20");

    const text = await liveText(calendar);
    expect(text).toContain("Selected");
    expect(text).toContain("March 20, 2024");

    cleanup(root);
  });

  test("range selection announces start then completed range", async () => {
    const { root, calendar } = await newCalendar({
      mode: "range",
      value: "2024-03-15",
      locale: "en-US",
    });

    clickDay(calendar, "2024-03-10");
    expect(await liveText(calendar)).toContain("Range start");

    clickDay(calendar, "2024-03-20");
    const text = await liveText(calendar);
    expect(text).toContain("Selected range");
    expect(text).toContain("March 10, 2024");
    expect(text).toContain("March 20, 2024");

    cleanup(root);
  });

  test("roving tabindex: only the focused day cell is tabbable", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    // The host carries no tabindex/role of its own — a focusable host with no
    // role would make a screen reader read the accessible name of the whole
    // subtree (every button) at once. The group container is not a tab stop.
    expect(calendar.getAttribute("tabindex")).toBeNull();
    expect(a11y(calendar).getByRole("group").getAttribute("tabindex")).toBeNull();

    const cells = [...calendar.shadowRoot.querySelectorAll(".day")];
    const tabbable = cells.filter((c) => c.getAttribute("tabindex") === "0");
    expect(tabbable.length).toBe(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2024-03-15");

    cleanup(root);
  });

  test("calendar.focus() delegates focus to the focused day cell", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    calendar.focus();

    // The host is a valid focus target (fallback "focus the calendar"),
    // but real focus lands on the focused day cell inside the shadow root.
    expect(document.activeElement).toBe(calendar);
    expect(calendar.shadowRoot.activeElement).toBe(
      getDayButton(calendar, "2024-03-15"),
    );

    cleanup(root);
  });

  test("calendar.focus() targets the year listbox while it is open", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    calendar.toggleYearPicker(new Event("click"));
    await calendar.updateComplete;

    calendar.focus();
    expect(calendar.shadowRoot.activeElement).toBe(
      calendar.shadowRoot.querySelector(".year-picker"),
    );

    cleanup(root);
  });

  test("keyboard navigation moves DOM focus to the new day cell", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      locale: "en-US",
    });

    calendar.focus();
    expect(calendar.shadowRoot.activeElement).toBe(
      getDayButton(calendar, "2024-03-15"),
    );

    calendar.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await calendar.updateComplete;

    expect(calendar.focusedDate).toBe("2024-03-16");

    // Roving tabindex: real focus moved to the next cell, which becomes the
    // sole tab stop. A screen reader announces just this cell.
    const newCell = getDayButton(calendar, "2024-03-16");
    expect(calendar.shadowRoot.activeElement).toBe(newCell);
    expect(newCell.getAttribute("tabindex")).toBe("0");
    expect(newCell.getAttribute("aria-label")).toContain("March 16, 2024");
    // The previously focused cell is no longer tabbable.
    expect(getDayButton(calendar, "2024-03-15").getAttribute("tabindex")).toBe(
      "-1",
    );

    cleanup(root);
  });

  test("year listbox is exposed with role, label, and active option", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    calendar.toggleYearPicker(new Event("click"));
    await calendar.updateComplete;

    const listbox = a11y(calendar).getByRole("listbox", { name: "Select year" });
    expect(listbox.getAttribute("tabindex")).toBe("0");
    expect(listbox.getAttribute("aria-activedescendant")).toBe("year-2024");

    cleanup(root);
  });

  test("year picker overlays the grid without removing it from layout", async () => {
    const { root, calendar } = await newCalendar({ value: "2024-03-15" });

    const body = calendar.shadowRoot.querySelector(".body");
    const grid = calendar.shadowRoot.querySelector(".days");
    expect(grid).toBeTruthy();

    calendar.toggleYearPicker(new Event("click"));
    await calendar.updateComplete;

    // The day grid is still rendered (so the element keeps its dimensions),
    // but hidden from AT and removed from the tab order while the picker is up.
    expect(calendar.shadowRoot.querySelector(".days")).toBe(grid);
    expect(grid.getAttribute("aria-hidden")).toBe("true");
    // No day cell is tabbable while the (hidden) grid is behind the overlay.
    const tabbableCells = calendar.shadowRoot
      .querySelectorAll('.day[tabindex="0"]');
    expect(tabbableCells.length).toBe(0);

    // The picker is an absolutely-positioned overlay inside the same body box.
    const picker = calendar.shadowRoot.querySelector(".year-picker");
    expect(picker.parentElement).toBe(body);
    const pos = getComputedStyle(picker).position;
    if (pos) expect(pos).toBe("absolute"); // happy-dom may not resolve shadow CSS

    cleanup(root);
  });

  test("selecting a year announces the new month and year", async () => {
    const { root, calendar } = await newCalendar({
      value: "2024-03-15",
      locale: "en-US",
    });

    calendar.toggleYearPicker(new Event("click"));
    await calendar.updateComplete;

    calendar.selectYear(2027);

    expect(calendar.yearPickerOpen).toBe(false);
    const text = await liveText(calendar);
    expect(text).toContain("March");
    expect(text).toContain("2027");

    cleanup(root);
  });
});

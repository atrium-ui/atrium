# calendar

An endless, zoomable calendar as a dependency-free custom element. Every row is a week, zooming
goes continuously from about 40 weeks (a year) down to a single week (a day planner).

The calendar only shows the events it is given and reports what the user wants to change. It never
changes events itself.

```sh
bun run dev    # demo at demo/index.html
bun run build  # dist/index.js
```

## Usage

```html
<calendar-view storage-key="my-calendar" theme="auto" locale="de-DE"></calendar-view>
<script type="module">
  import "@luckydye/calendar";
  const calendar = document.querySelector("calendar-view");
  calendar.calendars = [{ id: "work", name: "Work", color: "#5b8def" }];
  calendar.activeCalendar = "work";
  calendar.userEmail = "me@example.com";
  calendar.events = [{ id: "1", calendarId: "work", title: "Review", start, end, allDay: false }];
  calendar.addEventListener("event-change", (e) => save(e.detail.id, e.detail.changes));
</script>
```

### Properties

| Property | |
|---|---|
| `events` | `CalendarEvent[]`, see `src/types.ts` |
| `calendars` | `{ id, name, color }[]`, every event's `calendarId` must be in here |
| `activeCalendar` | where new, duplicated and imported events go |
| `hiddenCalendars`, `lockedCalendars` | ids; locked calendars are read-only |
| `userEmail` | recognises the user's invitations |
| `locale` / `locale` attribute | language and region of all generated text |
| `firstDayOfWeek` | 0 = Sunday, `null` = from the region (browsers without `Intl` week info use Monday) |
| `theme` / `theme` attribute | `dark`, `light`, `solarized`, `high-contrast`, `auto`, or any name of your own |
| `strings` | partial overrides of the UI text, see `src/strings.ts` |
| `minDate`, `maxDate` | `Date` or `null`; limits the calendar to these days, e.g. a single week. Zoom is capped to the range and days outside it in the first and last week can't be used |
| `workHours` | `[8, 18]`, used by the off-hours layer |
| `busynessMode` | `"count"` or `"density"` |
| `expandThreshold` | row height in px from which rows get an all-day band and a time area (90) |
| `layers` | drawing layers, see below |
| `selection` | selected event ids |

Attributes: `storage-key` (where the view is remembered, default `calendar-view`),
`hide-toolbar`.

### Methods

`goTo(date)`, `goToday()`, `goMonth()`, `back()`, `forward()`, `setLayer(id, on)`,
`cancelInteraction()`, `appendSummary(id, chunk)`, `finishSummary(id)`, `failSummary(id)`,
`refreshTheme()`.

### Events

All are `CustomEvent`s that bubble out of the shadow root.

| Event | `detail` |
|---|---|
| `event-create` | `{ start, end, allDay, calendarId, duplicateOf? }` |
| `event-change` | `{ id, changes: { start?, end?, title?, description?, reminders?, response? } }` |
| `events-delete` | `{ ids }` |
| `calendar-import` | `{ data, fileName, calendarId }`, data is already checked to look like iCalendar |
| `selection-change` | `{ ids }` |
| `event-click` | `{ id }` |
| `range-select` | `{ from, to, columns, minutes }` |
| `refresh-request` | `{}` |
| `summary-request` / `summary-cancel` | `{ id, text }` / `{ id }` |
| `notify` | `{ text }`, feedback for the user like "3 events copied" or a failed import, to show in a toast or status bar |

## Styling

Everything is themed through CSS variables on the element, and every piece of the UI is a
`::part`. The canvas reads the same variables, so overrides apply to the drawn parts too.

```css
calendar-view {
  --cal-accent: hotpink;
  --cal-font: "Inter", sans-serif;
  --cal-event-radius: 2px;
}
calendar-view::part(toolbar) { display: none; }
```

See `src/styles.ts` for all variables. A host-side theme change the element can't observe (for
example a stylesheet swap) needs `refreshTheme()`. Changes to the `theme` attribute, the system
colour scheme, and `class`/`style`/`data-theme` on `<html>` or the element are picked up
automatically.

The `sidebar` slot holds anything you want next to the calendar.

## Layers

```ts
import { defaultLayers, type Layer } from "@luckydye/calendar";

const holidays: Layer = {
  id: "holidays",
  toggleable: true,
  label: () => "Holidays",
  draw({ ctx, scene, theme, model }) { /* draw inside the day columns */ },
};
calendar.layers = [...defaultLayers, holidays];
```

A header chip appears for every toggleable layer. Its dot colour comes from
`--cal-layer-<id>`.

## Input

| Input | Action |
|---|---|
| Wheel, trackpad, touch | scroll; middle-mouse drag pans |
| Ctrl/Cmd + wheel, pinch | zoom around the pointer |
| Drag in the gutter, Ctrl/Cmd + Alt + vertical drag | zoom |
| Drag on empty space | create; Shift freezes the length, Esc cancels |
| Drag an event / its edges | move / resize; Alt or Cmd while dragging duplicates; out of the browser exports an `.ics` |
| Ctrl/Cmd + drag on empty space | box select; add Shift to add to the selection |
| Alt held | draw over existing events |
| Touch | one finger scrolls, long press then drag creates, moves or resizes, two fingers zoom and pan |
| T, Esc, Delete, Ctrl/Cmd + C, Ctrl/Cmd + Shift + R | today, cancel/clear, delete, copy as iCalendar, refresh |

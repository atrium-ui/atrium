/* @jsxImportSource vue */
import type { CalendarEvent, CalendarView } from "@atrium-ui/calendar";
import { defineComponent } from "vue";

const today = new Date();
const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
const at = (days: number, hours: number) =>
  new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + days, hours);

const events: CalendarEvent[] = [
  { id: "1", calendarId: "conference", title: "Conference", start: at(0, 0), end: at(5, 0), allDay: true },
  { id: "2", calendarId: "conference", title: "Registration", start: at(0, 8), end: at(0, 10), allDay: false },
  { id: "3", calendarId: "conference", title: "Keynote", start: at(0, 10), end: at(0, 12), allDay: false },
  { id: "4", calendarId: "conference", title: "Workshops", start: at(1, 9), end: at(1, 17), allDay: false },
  { id: "5", calendarId: "conference", title: "Talks", start: at(2, 9), end: at(2, 13), allDay: false },
  { id: "6", calendarId: "conference", title: "Speaker dinner", start: at(2, 19), end: at(2, 22), allDay: false },
  { id: "7", calendarId: "conference", title: "Talks", start: at(3, 9), end: at(3, 16), allDay: false },
  { id: "8", calendarId: "conference", title: "Closing", start: at(4, 10), end: at(4, 12), allDay: false },
];

async function setup(calendar: CalendarView | null) {
  if (!calendar) return;

  // The element extends HTMLElement, so it can only be loaded in the browser.
  await import("@atrium-ui/calendar");
  if (calendar.calendars.length) return;

  calendar.firstDayOfWeek = 1;
  calendar.minDate = at(0, 0);
  calendar.maxDate = at(4, 0);
  calendar.calendars = [{ id: "conference", name: "Conference", color: "#5b8def" }];
  calendar.lockedCalendars = ["conference"];
  calendar.events = events;
}

/** A read-only schedule limited to the work days of a single week through `minDate` and `maxDate`. */
export const WeekExample = defineComponent(() => {
  return () => (
    <div class="w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <calendar-view
        ref={(el: unknown) => void setup(el as CalendarView | null)}
        storage-key="atrium-docs-calendar-week"
        theme="auto"
        class="block h-[600px] w-full"
      />
    </div>
  );
});

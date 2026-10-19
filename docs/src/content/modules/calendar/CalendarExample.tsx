/* @jsxImportSource vue */
import type { CalendarEvent, CalendarEventMap, CalendarView } from "@atrium-ui/calendar";

const calendars = [
  { id: "work", name: "Work", color: "#5b8def" },
  { id: "personal", name: "Personal", color: "#3ccf7e" },
];

const today = new Date();
const at = (days: number, hours: number) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + days, hours);

const initialEvents: CalendarEvent[] = [
  { id: "1", calendarId: "work", title: "Standup", start: at(0, 9), end: at(0, 10), allDay: false },
  { id: "2", calendarId: "work", title: "Design review", start: at(1, 14), end: at(1, 16), allDay: false },
  { id: "3", calendarId: "personal", title: "Climbing", start: at(2, 18), end: at(2, 20), allDay: false },
  { id: "4", calendarId: "personal", title: "Vacation", start: at(7, 0), end: at(12, 0), allDay: true },
];

async function setup(calendar: CalendarView | null) {
  if (!calendar) return;

  // The element extends HTMLElement, so it can only be loaded in the browser.
  await import("@atrium-ui/calendar");
  if (calendar.calendars.length) return;

  calendar.calendars = calendars;
  calendar.activeCalendar = "work";
  calendar.events = initialEvents;

  calendar.addEventListener("event-create", (e) => {
    const { start, end, allDay, calendarId } = (e as CustomEvent<CalendarEventMap["event-create"]>).detail;
    const id = crypto.randomUUID();
    calendar.events = [...calendar.events, { id, calendarId, title: "New event", start, end, allDay }];
  });

  calendar.addEventListener("event-change", (e) => {
    const { id, changes } = (e as CustomEvent<CalendarEventMap["event-change"]>).detail;
    calendar.events = calendar.events.map((event) => (event.id === id ? { ...event, ...changes } : event));
  });

  calendar.addEventListener("events-delete", (e) => {
    const { ids } = (e as CustomEvent<CalendarEventMap["events-delete"]>).detail;
    calendar.events = calendar.events.filter((event) => !ids.includes(event.id));
  });
}

export function CalendarExample() {
  return (
    <calendar-view
      ref={(el) => setup(el as CalendarView | null)}
      storage-key="atrium-docs-calendar"
      theme="auto"
      class="block h-[600px] w-full overflow-hidden rounded-xl"
    />
  );
}

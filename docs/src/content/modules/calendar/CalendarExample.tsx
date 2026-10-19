/* @jsxImportSource vue */
import type { CalendarEvent, CalendarEventMap, CalendarView } from "@atrium-ui/calendar";
import { defineComponent, ref, shallowRef } from "vue";

type View = CalendarEventMap["view-change"];

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

async function setup(calendar: CalendarView | null, onView: (view: View) => void) {
  if (!calendar) return;

  // The element extends HTMLElement, so it can only be loaded in the browser.
  await import("@atrium-ui/calendar");
  if (calendar.calendars.length) return;

  calendar.addEventListener("view-change", (e) => onView((e as CustomEvent<View>).detail));
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

const monthTitle = (view: View | null) =>
  view ? view.date.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "";

/** The calendar has no toolbar of its own, the host builds it from the element's methods and `view-change`. */
export const CalendarExample = defineComponent(() => {
  const calendar = shallowRef<CalendarView | null>(null);
  const view = ref<View | null>(null);

  const mount = (el: unknown) => {
    calendar.value = el as CalendarView | null;
    void setup(calendar.value, (next) => {
      view.value = next;
    });
  };

  return () => (
    <div class="w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div class="flex flex-wrap items-center gap-2 border-zinc-200 border-b bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          aria-label="Back"
          disabled={!view.value?.canBack}
          class="h-8 w-8 rounded-md border border-zinc-200 bg-white disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800"
          onClick={() => calendar.value?.back()}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Forward"
          disabled={!view.value?.canForward}
          class="h-8 w-8 rounded-md border border-zinc-200 bg-white disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800"
          onClick={() => calendar.value?.forward()}
        >
          ›
        </button>
        <button
          type="button"
          class="h-8 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          onClick={() => calendar.value?.goToday()}
        >
          Today
        </button>
        <span class="flex-1 truncate text-center font-semibold">{monthTitle(view.value)}</span>
        <input
          type="search"
          placeholder="Filter events…"
          aria-label="Filter events"
          class="h-8 w-40 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          onInput={(e: Event) => {
            if (calendar.value) calendar.value.filter = (e.target as HTMLInputElement).value;
          }}
        />
      </div>
      <calendar-view ref={mount} storage-key="atrium-docs-calendar" theme="auto" class="block h-[600px] w-full" />
    </div>
  );
});

import "../src/index.ts";
import type { CalendarEvent, CalendarInfo, Participant } from "../src/index.ts";

const ME = "me@example.com";

const calendars: CalendarInfo[] = [
  { id: "work", name: "Work", color: "#5b8def" },
  { id: "team", name: "Team", color: "#f2a33a" },
  { id: "personal", name: "Personal", color: "#3ccf7e" },
  { id: "holidays", name: "Holidays", color: "#c174f2" },
  { id: "shared", name: "Shared availability", color: "#ff6b6b" },
];
const locked = new Set(["holidays"]);
const hidden = new Set<string>();
let active = "work";

let seed = 7;
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  return seed / 2 ** 32;
};
const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)] as T;

let counter = 0;
const nextId = () => `demo-${++counter}`;
const today = new Date();
const at = (days: number, hours: number, minutes = 0) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + days, hours, minutes);

const LONG_DESCRIPTION = `Quarterly planning for the platform team.

Agenda:
1. Review of last quarter's goals and what we shipped, including the migration of the billing service, the new onboarding flow and the performance work on the search index.
2. Open incidents and the follow-ups that are still pending from the last two postmortems.
3. Capacity for the next quarter, hiring status and the on-call rotation.
4. Proposals: the event bus replacement, the design system refresh and the public API versioning policy.
5. Risks and dependencies on other teams, especially data platform and security.

Please read the planning document before the meeting and add comments directly in it. Bring a rough estimate for every proposal your team owns.

Join: https://meet.google.com/abc-defg-hij`;

const people: Participant[] = [
  { email: "sam@example.com", name: "Sam Carter", status: "accepted" },
  { email: "kim@example.com", name: "Kim Lee", status: "tentative" },
  { email: "ola@example.com", name: "Ola Berg", status: "declined" },
  { email: "noor@example.com", name: "Noor Haddad", status: "needs-action" },
];

function sampleEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const add = (event: Omit<CalendarEvent, "id">) => events.push({ id: nextId(), ...event });
  for (let d = -180; d <= 180; d++) {
    const weekday = at(d, 0).getDay();
    if (weekday === 0 || weekday === 6) {
      if (random() < 0.35) {
        const hour = 10 + Math.floor(random() * 8);
        add({ calendarId: "personal", title: pick(["Climbing", "Brunch", "Farmers market", "Cinema", "Long run"]), start: at(d, hour), end: at(d, hour + 2), allDay: false });
      }
      continue;
    }
    add({
      calendarId: "team",
      title: "Standup",
      start: at(d, 9, 30),
      end: at(d, 9, 45),
      allDay: false,
      recurring: true,
      organizer: { email: "lead@example.com", name: "Alex Lead" },
      participants: [{ email: ME, name: "Me", status: "accepted" }, ...people.slice(0, 2)],
      reminders: [5],
    });
    if (weekday === 4) {
      add({ calendarId: "work", title: "1:1 with Alex", start: at(d, 14), end: at(d, 14, 30), allDay: false, recurring: true, reminders: [10] });
    }
    const meetings = Math.floor(random() * 4);
    for (let m = 0; m < meetings; m++) {
      const hour = 10 + Math.floor(random() * 7);
      const minutes = pick([0, 30]);
      const length = pick([30, 45, 60, 90]);
      add({
        calendarId: pick(["work", "work", "team"]),
        title: pick(["Design review", "Sprint planning", "Customer call", "Interview", "Architecture sync", "Retro", "Pairing", "Budget review"]),
        start: at(d, hour, minutes),
        end: at(d, hour, minutes + length),
        allDay: false,
        location: random() < 0.3 ? pick(["Room Ada", "Room Turing", "Cafeteria"]) : undefined,
      });
    }
    if (random() < 0.12) {
      add({
        calendarId: "work",
        title: "Partner sync",
        start: at(d, 16),
        end: at(d, 17),
        allDay: false,
        organizer: { email: "partner@example.org", name: "Jordan Partner" },
        participants: [{ email: ME, name: "Me", status: pick(["needs-action", "tentative"]) }, ...people],
        description: "Monthly sync. Agenda will be shared beforehand.\nhttps://zoom.us/j/123456789",
      });
    }
  }
  for (let w = -26; w <= 26; w += 5) {
    const start = w * 7 + 2;
    add({ calendarId: "personal", title: pick(["Trip to Lisbon", "Family visit", "Hiking week"]), start: at(start, 0), end: at(start + 3 + Math.floor(random() * 4), 0), allDay: true });
  }
  for (let w = -24; w <= 24; w += 8) {
    add({ calendarId: "holidays", title: pick(["Public holiday", "Bank holiday", "Company day off"]), start: at(w * 7 + 1, 0), end: at(w * 7 + 2, 0), allDay: true, readOnly: true });
  }
  add({ calendarId: "work", title: "Conference", start: at(9, 9), end: at(11, 17), allDay: false, location: "Berlin" });
  add({ calendarId: "personal", title: "Night train", start: at(3, 22), end: at(4, 6, 30), allDay: false });
  add({ calendarId: "work", title: "Release day", start: at(1, 0), end: at(2, 0), allDay: true, tentative: true });
  add({
    calendarId: "work",
    title: "Quarterly planning",
    start: at(2, 13),
    end: at(2, 16),
    allDay: false,
    organizer: { email: "head@example.com", name: "Robin Head" },
    participants: [{ email: ME, name: "Me", status: "needs-action" }, ...people],
    description: LONG_DESCRIPTION,
    location: "Room Ada",
    url: "https://example.com/planning",
    reminders: [15, 60],
  });
  return events;
}

let events = sampleEvents();
const view = document.querySelector("calendar-view") as HTMLElementTagNameMap["calendar-view"];
const sidebar = view.querySelector("nav") as HTMLElement;

function render() {
  view.events = events;
  view.calendars = calendars;
  view.hiddenCalendars = hidden;
  view.lockedCalendars = locked;
  view.activeCalendar = active;
  renderSidebar();
}

function renderSidebar() {
  sidebar.querySelectorAll(".calendar").forEach((row) => row.remove());
  for (const calendar of calendars) {
    const row = document.createElement("div");
    row.className = "calendar";
    row.toggleAttribute("data-active", calendar.id === active);
    row.style.setProperty("--color", calendar.color);
    const visible = document.createElement("input");
    visible.type = "checkbox";
    visible.checked = !hidden.has(calendar.id);
    visible.title = "Show";
    visible.onchange = () => {
      if (visible.checked) hidden.delete(calendar.id);
      else hidden.add(calendar.id);
      render();
    };
    const label = document.createElement("label");
    label.textContent = calendar.name;
    label.title = "Make active";
    label.onclick = () => {
      active = calendar.id;
      render();
    };
    const lock = document.createElement("button");
    lock.textContent = locked.has(calendar.id) ? "locked" : "lock";
    lock.onclick = () => {
      if (locked.has(calendar.id)) locked.delete(calendar.id);
      else locked.add(calendar.id);
      render();
    };
    row.append(visible, label, lock);
    sidebar.append(row);
  }
}

view.userEmail = ME;

view.addEventListener("event-create", ({ detail }) => {
  const source = detail.duplicateOf ? events.find((event) => event.id === detail.duplicateOf) : undefined;
  const created: CalendarEvent = {
    ...source,
    id: nextId(),
    calendarId: detail.calendarId,
    title: source?.title ?? "New event",
    start: detail.start,
    end: detail.end,
    allDay: detail.allDay,
    readOnly: false,
  };
  events = [...events, created];
  render();
  view.selection = [created.id];
});

view.addEventListener("event-change", ({ detail }) => {
  const { response, ...changes } = detail.changes;
  events = events.map((event) => {
    if (event.id !== detail.id) return event;
    const participants = response
      ? event.participants?.map((p) => (p.email === ME ? { ...p, status: response } : p))
      : event.participants;
    return { ...event, ...changes, participants };
  });
  render();
});

view.addEventListener("events-delete", ({ detail }) => {
  events = events.filter((event) => !detail.ids.includes(event.id));
  render();
});

view.addEventListener("calendar-import", ({ detail }) => {
  events = [...events, ...parseICS(detail.data, detail.calendarId)];
  render();
});

view.addEventListener("refresh-request", () => render());

const summaries = new Map<string, ReturnType<typeof setInterval>>();
view.addEventListener("summary-request", ({ detail }) => {
  const words =
    "The platform team reviews last quarter, open incidents and capacity, then decides on three proposals: the event bus replacement, the design system refresh and API versioning. Read the planning document and bring estimates.".split(" ");
  let i = 0;
  summaries.set(
    detail.id,
    setInterval(() => {
      if (i === words.length) {
        clearInterval(summaries.get(detail.id));
        summaries.delete(detail.id);
        view.finishSummary(detail.id);
        return;
      }
      view.appendSummary(detail.id, `${i ? " " : ""}${words[i++]}`);
    }, 60),
  );
});
view.addEventListener("summary-cancel", ({ detail }) => {
  clearInterval(summaries.get(detail.id));
  summaries.delete(detail.id);
});

/** Minimal iCalendar reader for the demo: DTSTART, DTEND, SUMMARY, DESCRIPTION and LOCATION. */
function parseICS(data: string, calendarId: string): CalendarEvent[] {
  const lines = data.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const parsed: CalendarEvent[] = [];
  let current: Record<string, string> | null = null;
  const unescape = (value: string) => value.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
  const toDate = (value: string) => {
    const [, y, mo, d, h = "0", mi = "0", s = "0", z] = value.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/) ?? [];
    const parts = [Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)] as const;
    return z ? new Date(Date.UTC(...parts)) : new Date(...parts);
  };
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") current = {};
    else if (line === "END:VEVENT" && current) {
      const allDay = /^\d{8}$/.test(current.DTSTART ?? "");
      const start = toDate(current.DTSTART ?? "");
      const end = current.DTEND ? toDate(current.DTEND) : new Date(start.getTime() + (allDay ? 86_400_000 : 3_600_000));
      parsed.push({
        id: nextId(),
        calendarId,
        title: unescape(current.SUMMARY ?? ""),
        description: current.DESCRIPTION && unescape(current.DESCRIPTION),
        location: current.LOCATION && unescape(current.LOCATION),
        start,
        end,
        allDay,
      });
      current = null;
    } else if (current) {
      const colon = line.indexOf(":");
      const name = line.slice(0, colon).split(";")[0] as string;
      if (!(name in current)) current[name] = line.slice(colon + 1);
    }
  }
  return parsed;
}

render();

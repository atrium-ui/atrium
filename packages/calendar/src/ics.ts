import type { CalendarEvent } from "./types.ts";

const pad = (n: number) => String(n).padStart(2, "0");

const utc = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const date = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

const text = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const param = (value: string) => `"${value.replace(/"/g, "'")}"`;

/** Folds a content line to 75 octets as RFC 5545 requires. */
function fold(line: string): string {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const code = char.codePointAt(0) as number;
    const size = code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    if (bytes + size > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n ");
}

/** Serialises events as an iCalendar document. */
export function toICS(events: readonly CalendarEvent[]): string {
  const stamp = utc(new Date());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//luckydye//calendar//EN", "CALSCALE:GREGORIAN"];
  for (const event of events) {
    lines.push("BEGIN:VEVENT", `UID:${event.id}`, `DTSTAMP:${stamp}`);
    if (event.allDay) lines.push(`DTSTART;VALUE=DATE:${date(event.start)}`, `DTEND;VALUE=DATE:${date(event.end)}`);
    else lines.push(`DTSTART:${utc(event.start)}`, `DTEND:${utc(event.end)}`);
    lines.push(`SUMMARY:${text(event.title)}`);
    if (event.description) lines.push(`DESCRIPTION:${text(event.description)}`);
    if (event.location) lines.push(`LOCATION:${text(event.location)}`);
    if (event.url) lines.push(`URL:${event.url}`);
    if (event.tentative) lines.push("STATUS:TENTATIVE");
    if (event.organizer) {
      const name = event.organizer.name ? `;CN=${param(event.organizer.name)}` : "";
      lines.push(`ORGANIZER${name}:mailto:${event.organizer.email}`);
    }
    for (const participant of event.participants ?? []) {
      const name = participant.name ? `;CN=${param(participant.name)}` : "";
      lines.push(`ATTENDEE${name};PARTSTAT=${participant.status.toUpperCase()}:mailto:${participant.email}`);
    }
    for (const minutes of event.reminders ?? []) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${text(event.title)}`, `TRIGGER:-PT${minutes}M`, "END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/** Cheap structural check for iCalendar data before it is handed to the host. */
export function isCalendarData(data: string): boolean {
  return /^\s*BEGIN:VCALENDAR\b/i.test(data) && /END:VCALENDAR\s*$/i.test(data);
}

export function icsFileName(event: CalendarEvent): string {
  const base = event.title.replace(/[\\/:*?"<>|\n\r]+/g, " ").trim() || "event";
  return `${base.slice(0, 60)}.ics`;
}

export type ResponseStatus = "accepted" | "tentative" | "declined" | "needs-action" | "delegated";

export interface Person {
  email: string;
  name?: string;
}

export interface Participant extends Person {
  status: ResponseStatus;
}

export interface CalendarInfo {
  id: string;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  start: Date;
  /** Exclusive. For all-day events this is the midnight after the last day. */
  end: Date;
  allDay: boolean;
  description?: string;
  location?: string;
  url?: string;
  recurring?: boolean;
  organizer?: Person;
  participants?: Participant[];
  tentative?: boolean;
  /** Minutes before the start. */
  reminders?: number[];
  readOnly?: boolean;
  /** Only counts towards the busyness layer, never drawn as a block. */
  busyOnly?: boolean;
}

export interface EventChanges {
  start?: Date;
  end?: Date;
  allDay?: boolean;
  title?: string;
  description?: string;
  reminders?: number[];
  response?: ResponseStatus;
}

export interface RangeSelection {
  /** First selected day. */
  from: Date;
  /** Midnight after the last selected day. */
  to: Date;
  /** Selected day columns, inclusive. */
  columns: [number, number];
  /** Time of day in minutes when a time range was selected, otherwise whole days. */
  minutes: [number, number] | null;
}

/** Events the calendar dispatches on its element. */
export interface CalendarEventMap {
  "event-create": { start: Date; end: Date; allDay: boolean; calendarId: string; duplicateOf?: string };
  "event-change": { id: string; changes: EventChanges };
  "events-delete": { ids: string[] };
  "calendar-import": { data: string; fileName: string | null; calendarId: string };
  "selection-change": { ids: string[] };
  "event-click": { id: string };
  "range-select": RangeSelection;
  "refresh-request": Record<string, never>;
  "summary-request": { id: string; text: string };
  "summary-cancel": { id: string };
  "notify": { text: string };
}

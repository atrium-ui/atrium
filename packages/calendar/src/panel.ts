import { h } from "./dom.ts";
import type { Formats } from "./format.ts";
import type { SummaryState } from "./model.ts";
import type { Strings } from "./strings.ts";
import type { CalendarEvent, CalendarInfo, EventChanges, ResponseStatus } from "./types.ts";

export interface PanelData {
  event: CalendarEvent;
  calendar: CalendarInfo;
  formats: Formats;
  strings: Strings;
  canEdit: boolean;
  canEditTitle: boolean;
  invited: boolean;
  response: ResponseStatus | null;
  userEmail: string;
  summary: SummaryState | null;
}

export const REMINDER_PRESETS = [0, 5, 15, 30, 60, 120, 1440];
const MEETING_LINK =
  /https?:\/\/[^\s<>"')]*(?:zoom\.us\/j\/|teams\.microsoft\.com\/l\/meetup-join|teams\.live\.com\/meet|meet\.google\.com\/|webex\.com\/(?:meet|join)|whereby\.com\/)[^\s<>"')]*/i;
const LONG_DESCRIPTION = 280;
const LONG_LINES = 6;
const SUMMARIZE_FROM = 600;
const SAVE_DELAY = 600;

interface Focus {
  id: string;
  name: string;
  value: string;
  start: number | null;
  end: number | null;
}

/**
 * Detail card of one event. Renders the data it is given and reports what the user wants
 * through `panel-change`, `panel-close`, `panel-summarize` and `panel-respond` events.
 * It renders into its own light DOM so the calendar's stylesheet and parts apply.
 */
export class CalendarEventPanel extends HTMLElement {
  data: PanelData | null = null;
  expanded = false;
  showOriginal = false;
  pending: EventChanges = {};
  saveTimer: ReturnType<typeof setTimeout> | undefined;

  show(data: PanelData) {
    if (data.event.id !== this.data?.event.id) {
      this.flush();
      this.expanded = false;
      this.showOriginal = false;
    }
    this.data = data;
    this.render();
  }

  clear() {
    this.flush();
    this.data = null;
    this.replaceChildren();
  }

  queue(changes: EventChanges, immediate: boolean) {
    Object.assign(this.pending, changes);
    clearTimeout(this.saveTimer);
    if (immediate) this.flush();
    else this.saveTimer = setTimeout(() => this.flush(), SAVE_DELAY);
  }

  flush() {
    clearTimeout(this.saveTimer);
    const data = this.data;
    if (!data || !Object.keys(this.pending).length) return;
    const changes = this.pending;
    this.pending = {};
    this.send("panel-change", { id: data.event.id, changes });
  }

  send(type: string, detail: unknown) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
  }

  render() {
    const data = this.data;
    if (!data) return;
    const { event, strings, formats, calendar } = data;
    const focus = this.captureFocus();
    this.style.setProperty("--event-color", calendar.color);
    this.replaceChildren(
      h(
        "div",
        { part: "panel-header" },
        h(
          "div",
          { part: "panel-top" },
          h("div", { part: "panel-calendar" }, calendar.name),
          h(
            "button",
            {
              part: "panel-close",
              type: "button",
              title: strings.close,
              "aria-label": strings.close,
              onclick: () => this.send("panel-close", null),
            },
            "×",
          ),
        ),
        data.canEditTitle
          ? h("input", {
              part: "panel-title-input",
              name: "title",
              value: this.pending.title ?? event.title,
              placeholder: strings.untitled,
              "aria-label": strings.untitled,
              oninput: (e: Event) => this.queue({ title: (e.target as HTMLInputElement).value }, false),
              onkeydown: (e: KeyboardEvent) => {
                if (e.key === "Enter") this.queue({}, true);
                if (e.key === "Escape") (e.target as HTMLInputElement).blur();
              },
              onblur: () => this.flush(),
            })
          : h("h2", { part: "panel-title" }, `${event.recurring ? "↻ " : ""}${event.title || strings.untitled}`),
        h("div", { part: "panel-when" }, ...formats.when(event).map((line) => h("div", {}, line))),
      ),
      h(
        "div",
        { part: "panel-body" },
        this.location(data),
        event.url &&
          this.section(strings.link, h("a", { part: "panel-link", href: event.url, target: "_blank", rel: "noopener noreferrer" }, event.url)),
        event.organizer &&
          this.section(
            strings.organizer,
            h("div", { part: "panel-person", title: event.organizer.email }, event.organizer.name || event.organizer.email),
          ),
        this.participants(data),
        event.rruleEditable && this.repeat(data),
        data.canEdit && this.reminders(data),
        this.description(data),
      ),
      ...(data.invited ? [this.responses(data)] : []),
    );
    this.restoreFocus(focus);
  }

  section(label: string, ...content: (Node | null | false)[]) {
    return h("section", { part: "panel-section" }, h("div", { part: "panel-label" }, label), ...content);
  }

  location({ event, strings }: PanelData) {
    const meeting = event.description?.match(MEETING_LINK)?.[0];
    if (!event.location && !meeting) return null;
    return this.section(
      strings.location,
      event.location ? h("div", { part: "panel-value" }, event.location) : null,
      meeting
        ? h("a", { part: "button panel-join", href: meeting, target: "_blank", rel: "noopener noreferrer" }, strings.joinMeeting)
        : null,
    );
  }

  participants({ event, strings, userEmail }: PanelData) {
    const others = (event.participants ?? []).filter((p) => p.email.toLowerCase() !== userEmail.toLowerCase());
    if (!others.length) return null;
    return this.section(
      strings.participants,
      h(
        "ul",
        { part: "panel-participants" },
        ...others.map((participant) =>
          h(
            "li",
            { part: "panel-participant", "data-status": participant.status, title: participant.email },
            h("span", { part: "panel-person" }, participant.name || participant.email),
            h("span", { part: "panel-response" }, strings.responses[participant.status]),
          ),
        ),
      ),
    );
  }

  repeat({ event, strings }: PanelData) {
    const current = event.rrule ?? "";
    const rules = Object.keys(strings.repeats);
    if (!rules.includes(current)) rules.push(current);
    return this.section(
      strings.repeat,
      h(
        "select",
        {
          part: "panel-select",
          "aria-label": strings.repeat,
          onchange: (e: Event) =>
            this.send("panel-change", { id: event.id, changes: { rrule: (e.target as HTMLSelectElement).value } }),
        },
        ...rules.map((rule) => h("option", { value: rule, selected: rule === current }, strings.repeats[rule] ?? rule)),
      ),
    );
  }

  reminders({ event, strings, formats }: PanelData) {
    const reminders = event.reminders ?? [];
    const save = (next: number[]) => this.send("panel-change", { id: event.id, changes: { reminders: next } });
    const unused = REMINDER_PRESETS.find((minutes) => !reminders.includes(minutes));
    const add =
      unused !== undefined &&
      h("button", { part: "panel-add", type: "button", onclick: () => save([...reminders, unused]) }, `+ ${strings.addNotification}`);
    // Without reminders the section is just its add button, a label and an empty state would only take space.
    if (!reminders.length) return add;
    return this.section(
      strings.notifications,
      ...reminders.map((minutes, i) =>
        h(
          "div",
          { part: "panel-reminder" },
          h(
            "select",
            {
              part: "panel-select",
              "aria-label": strings.notifications,
              onchange: (e: Event) => save(reminders.map((m, j) => (j === i ? Number((e.target as HTMLSelectElement).value) : m))),
            },
            ...[...new Set([...REMINDER_PRESETS, minutes])]
              .sort((a, b) => a - b)
              .map((preset) => h("option", { value: String(preset), selected: preset === minutes }, formats.reminder(preset, strings))),
          ),
          h(
            "button",
            {
              part: "panel-icon-button",
              type: "button",
              title: strings.removeNotification,
              "aria-label": strings.removeNotification,
              onclick: () => save(reminders.filter((_, j) => j !== i)),
            },
            "×",
          ),
        ),
      ),
      add,
    );
  }

  description(data: PanelData) {
    const { event, strings, summary } = data;
    const text = this.pending.description ?? event.description ?? "";
    if (!data.canEdit && !text) return null;
    const content: (Node | null | false)[] = [];

    if (summary?.status === "error") content.push(h("div", { part: "panel-notice" }, strings.summaryFailed));
    else if (summary) {
      content.push(
        h(
          "div",
          { part: "panel-summary", "data-status": summary.status },
          h("div", { part: "panel-label" }, summary.status === "streaming" ? strings.summarizing : strings.summarize),
          summary.status === "streaming" && h("div", { part: "panel-progress", role: "progressbar" }),
          h("div", { part: "panel-summary-text" }, summary.text),
        ),
      );
    } else if (text.length >= SUMMARIZE_FROM) {
      content.push(h("button", { part: "panel-add", type: "button", onclick: () => this.send("panel-summarize", null) }, strings.summarize));
    }

    const original = !summary || summary.status === "error" || this.showOriginal;
    if (summary?.status === "done") {
      content.push(
        h(
          "button",
          { part: "panel-add", type: "button", onclick: () => ((this.showOriginal = !this.showOriginal), this.render()) },
          this.showOriginal ? strings.hideOriginal : strings.showOriginal,
        ),
      );
    }

    if (data.canEdit && original) {
      const input = h("textarea", {
        part: "panel-description-input",
        name: "description",
        value: text,
        // Grows with its content through `field-sizing`, rows only matter where that isn't supported.
        rows: text ? 4 : 1,
        placeholder: strings.addDescription,
        "aria-label": strings.description,
        oninput: (e: Event) => this.queue({ description: (e.target as HTMLTextAreaElement).value }, false),
        onblur: () => this.flush(),
      });
      // An empty description is just its field, the placeholder already says what it is for.
      if (!text && !content.length) return input;
      content.push(input);
    } else if (original) {
      const long = text.length > LONG_DESCRIPTION || text.split("\n").length > LONG_LINES;
      content.push(h("div", { part: "panel-description", "data-clamped": long && !this.expanded }, text));
      if (long) {
        content.push(
          h(
            "button",
            { part: "panel-add", type: "button", onclick: () => ((this.expanded = !this.expanded), this.render()) },
            this.expanded ? strings.showLess : strings.showMore,
          ),
        );
      }
    }
    return this.section(strings.description, ...content);
  }

  responses({ strings, response }: PanelData) {
    const options: [ResponseStatus, string][] = [
      ["accepted", strings.accept],
      ["tentative", strings.maybe],
      ["declined", strings.decline],
    ];
    return h(
      "div",
      { part: "panel-footer" },
      ...options.map(([status, label]) =>
        h(
          "button",
          {
            part: "button panel-respond",
            type: "button",
            "data-status": status,
            "aria-pressed": String(response === status),
            onclick: () => this.send("panel-respond", status),
          },
          label,
        ),
      ),
    );
  }

  captureFocus(): Focus | null {
    const field = this.querySelector<HTMLInputElement | HTMLTextAreaElement>("input:focus, textarea:focus");
    if (!field || !this.data) return null;
    return { id: this.data.event.id, name: field.name, value: field.value, start: field.selectionStart, end: field.selectionEnd };
  }

  restoreFocus(focus: Focus | null) {
    if (!focus || focus.id !== this.data?.event.id) return;
    const field = this.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${focus.name}"]`);
    if (!field) return;
    field.value = focus.value;
    field.focus();
    field.setSelectionRange(focus.start, focus.end);
  }
}

import { CalendarView } from "./element.ts";
import { CalendarEventPanel } from "./panel.ts";

export { CalendarView } from "./element.ts";
export { isCalendarData, toICS } from "./ics.ts";
export { CalendarModel } from "./model.ts";
export {
  busynessLayer,
  defaultLayers,
  eventsLayer,
  gridLayer,
  interactionLayer,
  type Layer,
  offHoursLayer,
  type Paint,
} from "./paint.ts";
export { CalendarEventPanel, type PanelData } from "./panel.ts";
export type { EventBox, Scene, SceneDay, SceneRow } from "./scene.ts";
export { defaultStrings, type Strings } from "./strings.ts";
export { type ThemeName, themes } from "./styles.ts";
export type { Theme } from "./theme.ts";
export type * from "./types.ts";

// The panel must exist before the calendar builds its shadow DOM.
customElements.define("calendar-event-panel", CalendarEventPanel);
customElements.define("calendar-view", CalendarView);

declare global {
  interface HTMLElementTagNameMap {
    "calendar-view": CalendarView;
    "calendar-event-panel": CalendarEventPanel;
  }
}

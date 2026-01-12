/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { CalendarViewElement } from "./CalendarView.js";

declare global {
  interface HTMLElementTagNameMap {
    "calendar-view": CalendarViewElement;
  }
}

try {
  customElements.define("calendar-view", CalendarViewElement);
} catch (err) {
  console.warn("calendar-view already defined");
}

export { CalendarViewElement };

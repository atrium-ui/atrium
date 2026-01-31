/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { CalendarElement } from "./Calendar.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-calendar": CalendarElement;
  }
}

try {
  customElements.define("a-calendar", CalendarElement);
} catch (err) {
  console.warn("a-calendar already defined");
}

export { CalendarElement };

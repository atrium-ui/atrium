/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { DatepickerElement } from "./Datepicker.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-datepicker": DatepickerElement;
  }
}

try {
  customElements.define("a-datepicker", DatepickerElement);
} catch (err) {
  console.warn("a-datepicker already defined");
}

export { DatepickerElement };

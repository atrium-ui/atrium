/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { ColorPickerElement } from "./ColorPicker.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-color-picker": ColorPickerElement;
  }
}

try {
  customElements.define("a-color-picker", ColorPickerElement);
} catch (err) {
  console.warn("a-color-picker already defined");
}

export { ColorPickerElement };

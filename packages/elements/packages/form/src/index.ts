/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { FormFieldElement, FormFieldErrorElement } from "./Form.js";

try {
  if (typeof window !== "undefined") {
    customElements.define("a-form-field", FormFieldElement);
    customElements.define("a-form-field-error", FormFieldErrorElement);
  }
} catch (err) {
  console.warn("a-form-field already defined");
}

export { FormFieldElement, FormFieldErrorElement };

/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import "@sv/elements/expandable";
import { Dropdown } from "./components/dropdown/Dropdown";
import { OptionElement } from "./components/dropdown/Option";

try {
  customElements.define("a-option", OptionElement);
  customElements.define("a-dropdown", Dropdown);
} catch (err) {
  console.warn("a-dropdown already defined");
}

export { Dropdown, OptionElement };

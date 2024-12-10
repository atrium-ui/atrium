/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { Tabs } from "./Tabs.js";

try {
  customElements.define("a-tabs", Tabs);
} catch (err) {
  console.warn("a-tabs already defined");
}

export { Tabs };

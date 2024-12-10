/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { TabsElement } from "./Tabs.js";

try {
  customElements.define("a-tabs", TabsElement);
} catch (err) {
  console.warn("a-tabs already defined");
}

export { TabsElement as Tabs };

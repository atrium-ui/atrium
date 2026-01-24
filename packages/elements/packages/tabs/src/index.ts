/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { TabsListElement, TabsPanelElement, TabsElement, TabsTabElement } from "./Tabs.js";

// define global interface for typescript check
declare global {
  interface HTMLElementTagNameMap {
    "a-tabs": TabsElement;
    "a-tabs-tab": TabsTabElement;
    "a-tabs-panel": TabsPanelElement;
    "a-tabs-list": TabsListElement;
  }
}

if (!customElements.get("a-tabs")) {
  customElements.define("a-tabs", TabsElement);
}

if (!customElements.get("a-tabs-list")) {
  customElements.define("a-tabs-list", TabsListElement);
}

if (!customElements.get("a-tabs-panel")) {
  customElements.define("a-tabs-panel", TabsPanelElement);
}

if (!customElements.get("a-tabs-tab")) {
  customElements.define("a-tabs-tab", TabsTabElement);
}

/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import {
  PopoverTrigger,
  Popover,
  PopoverPortal,
  PopoverArrow,
  Tooltip,
} from "./Popover.js";

try {
  customElements.define("a-popover-portal", PopoverPortal);
  customElements.define("a-tooltip", Tooltip);
  customElements.define("a-popover", Popover);
  customElements.define("a-popover-trigger", PopoverTrigger);
  customElements.define("a-popover-arrow", PopoverArrow);
} catch (err) {
  console.warn("a-popover already defined");
}

export { PopoverTrigger, Popover, PopoverPortal, Tooltip };

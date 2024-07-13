/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { PopoverTrigger, Popover, PopoverPortal } from "./Popover.js";

customElements.define("a-popover-portal", PopoverPortal);
customElements.define("a-popover", Popover);
customElements.define("a-popover-trigger", PopoverTrigger);

export { PopoverTrigger, Popover, PopoverPortal };

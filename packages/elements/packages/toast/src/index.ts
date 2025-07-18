/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { ToastFeed, Toast } from "./Toast.js";

try {
  if (typeof window !== "undefined") {
    customElements.define("a-toast-feed", ToastFeed);
    customElements.define("a-toast", Toast);
  }
} catch (err) {
  console.warn("a-toast already defined");
}

export { ToastFeed, Toast };

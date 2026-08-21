/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { ToastFeed, Toast, type ToastOptions } from "./Toast.js";
import { render, html } from "lit";

try {
  if (typeof window !== "undefined") {
    customElements.define("a-toast-feed", ToastFeed);
    customElements.define("a-toast", Toast);
  }
} catch (err) {
  console.warn("a-toast already defined");
}

/**
 * Show a toast message.
 *
 * Copy this function to your project and modify it to suit your needs.
 *
 * @param optns - The options for the toast.
 */
export function showToast(optns: ToastOptions) {
  const toast = new Toast(optns);
  const feed = ToastFeed.getInstance(); // the a-toast-feed element
  feed?.append(toast);

  render(html`<span>${optns.message}</span>`, toast);
}

export { ToastFeed, Toast };
export type { ToastOptions };

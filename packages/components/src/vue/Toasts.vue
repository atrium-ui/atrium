<script setup lang="ts">
import "@sv/elements/toast";
</script>

<script lang="ts">
import { Toast, ToastFeed } from "@sv/elements/toast";

const TOAST_TYPE = {
  default: "default",
  error: "error",
  transparent: "transparent",
};

type ToastButton = {
  label: string;
  onClick: () => void;
};

export interface ToastOptions {
  id?: string;
  message?: string;
  time?: number;
  variant?: keyof typeof TOAST_TYPE;
}

const toasts: Map<string, Toast> = new Map();

export function toast(options: ToastOptions) {
  if (options.id && toasts.has(options.id)) {
    const existingToast = toasts.get(options.id);
    existingToast?.kill();
    toasts.delete(options.id);
  }

  const newToast = new Toast({ time: options.time });
  newToast.className = `variant-${options.variant || TOAST_TYPE.default}`;

  const content = document.createElement("div");
  content.className = "flex gap-4 rounded-md bg-white px-6 py-4 text-black text-sm shadow-lg";

  const textContainer = document.createElement("div");

  const message = document.createElement("div");
  message.className = "pointer-events-none select-none";
  message.textContent = options.message || "";
  textContainer.appendChild(message);

  content.appendChild(textContainer);
  newToast.appendChild(content);

  const feed = ToastFeed.getInstance();
  feed?.append(newToast);

  if (options.id) toasts.set(options.id, newToast);

  return newToast;
}
</script>

<template>
  <div class="pointer-events-none absolute right-0 bottom-4 z-100 w-full md:max-w-[460px] lg:right-4">
    <a-toast-feed class="px-4 text-base [&>*]:pointer-events-auto [&>*]:mb-2" />
  </div>
</template>

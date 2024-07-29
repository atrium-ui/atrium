/* @jsxImportSource vue */
import "@sv/elements/portal";
import "@sv/elements/toast";
import { Toast, ToastFeed } from "@sv/elements/toast";

const TOAST_TYPE = {
  default: "default",
  error: "error",
  transparent: "transparent",
};

export interface ToastOptions {
  id?: string;
  message?: string;
  time?: number;
  variant?: keyof typeof TOAST_TYPE;
}

const toasts: Map<string, Toast> = new Map();

export function toast(options: ToastOptions, toastType: typeof Toast = Toast) {
  if (options.id && toasts.has(options.id)) {
    // kill existing toast with same id
    const toast = toasts.get(options.id);
    toast?.kill();
    toasts.delete(options.id);
  }

  const toast = new toastType(options);
  toast.className = `variant-${options.variant || TOAST_TYPE.default}`;
  const feed = ToastFeed.getInstance();
  feed?.append(toast);

  if (options.id) toasts.set(options.id, toast);

  return toast;
}

export function Toasts() {
  return (
    <a-portal>
      <a-toast-feed class="fixed right-12 bottom-12 text-base" />
    </a-portal>
  );
}

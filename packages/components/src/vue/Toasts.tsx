/* @jsxImportSource vue */
import "@sv/elements/portal";
import "@sv/elements/toast";
import { Toast, ToastFeed } from "@sv/elements/toast";
import { Button } from "./Button";

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
  const ele = document.createElement("div");
  ele.style.margin = "4px 0";
  ele.append(toast);
  feed?.append(ele);

  if (options.id) toasts.set(options.id, toast);

  return toast;
}

export function ToastDemo() {
  return (
    <div>
      <Button
        onClick={() => {
          toast({
            message: "Lorem ipsum is simply dummy text",
            time: 3000,
          });
        }}
      >
        Show Toast
      </Button>

      <a-portal>
        <a-toast-feed class="fixed right-12 bottom-12 text-base" />
      </a-portal>
    </div>
  );
}

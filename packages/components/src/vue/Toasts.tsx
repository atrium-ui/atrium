/* @jsxImportSource vue */
import { Toast, ToastFeed } from "@sv/elements/toast";
import { defineCustomElement } from "vue";
import { Button } from "./Button.js";
import { Icon, type IconName } from "./Icon.js";

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
  button?: ToastButton;
  icon?: IconName;
  time?: number;
  variant?: keyof typeof TOAST_TYPE;
}

const toasts: Map<string, Toast> = new Map();

export function toast(options: ToastOptions) {
  if (options.id && toasts.has(options.id)) {
    // kill existing toast with same id
    const toast = toasts.get(options.id);
    toast?.kill();
    toasts.delete(options.id);
  }

  // create new toast
  const toast = new Toast({ time: options.time });
  toast.className = `variant-${options.variant || TOAST_TYPE.default}`;
  toast.append(
    new ToastContent({
      message: options.message,
      button: options.button,
      icon: options.icon,
    }),
  );

  const feed = ToastFeed.getInstance();
  feed?.append(toast);
  if (options.id) toasts.set(options.id, toast);

  return toast;
}

export const ToastContent = defineCustomElement(
  (props: { message: string; icon?: IconName; button?: ToastButton }) => {
    return () => (
      <div class="flex gap-4 rounded-lg bg-white px-6 py-4 text-black shadow-md">
        {props.icon && <Icon class="flex-none text-xl" name={props.icon} />}
        <div>
          <div class="pointer-events-none pb-4">{props.message}</div>
          {props.button && (
            <Button class="text-button" onClick={(e) => props.button?.onClick()}>
              {props.button.label}
            </Button>
          )}
        </div>
      </div>
    );
  },
  {
    shadowRoot: false,
    props: ["message", "icon", "button"],
  },
);

customElements.define("toast-content", ToastContent);

export function Toasts() {
  return (
    <div class="pointer-events-none absolute right-0 bottom-4 z-100 w-full md:max-w-[460px] lg:right-4">
      <a-toast-feed class="px-4 text-base *:pointer-events-auto" />
    </div>
  );
}

/* @jsxImportSource vue */
import { Toast, ToastFeed } from "@sv/elements/toast";
import { defineCustomElement } from "vue";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

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

const toastContentStyles = `
  .content {
    display: flex;
    margin-top: 0.5rem;
    padding: 1rem 1.5rem;
    font-weight: 300;
    background: #333;
    color: white;
    border-radius: 0.5rem;
    max-width: 100%;
  }

  .status-icon {
    margin-top: 0.15rem;
    margin-right: 1em;
    width: 1em;
    height: 1em;
    flex: none;
  }

  button {
    all: inherit;
    cursor: pointer;
    pointer-events: auto;
  }

  button:hover {
    color: blue;
  }

  .text-button {
    margin-top: 0.8rem;
    text-decoration: underline;
  }
`;

// @ts-ignore
export const ToastContent = defineCustomElement(
  (props: {
    message: string;
    icon?: IconName;
    button?: ToastButton;
  }) => {
    return () => (
      <div style="pointer-events: none">
        <div class="content">
          {props.icon && <Icon class="status-icon" name={props.icon} />}
          <div>
            <div>{props.message}</div>
            {props.button && (
              <Button class="text-button" onClick={props.button.onClick}>
                {props.button.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  },
  {
    props: ["message", "icon", "button"],
    styles: [toastContentStyles],
  },
);

customElements.define("toast-content", ToastContent);

export function Toasts() {
  return (
    <div class="pointer-events-none fixed right-0 bottom-4 z-50 w-full md:max-w-[460px] lg:right-4">
      <a-toast-feed class="px-4 text-base [&>*]:pointer-events-auto" />
    </div>
  );
}

/* @jsxImportSource vue */
import { twJoin } from "tailwind-merge";

export const buttonVariants = {
  base: [
    "inline-flex items-center gap-1 rounded-md font-sans",
    "aria-disabled:pointer-events-none cursor-pointer",
  ],
  default: [
    "border-0 bg-blue-400 px-4 py-2 text-white transition-colors",
    "hover:bg-blue-200 hover:text-white",
    "active:bg-blue-300 active:transition-none",
    "aria-disabled:bg-gray-100 aria-disabled:text-gray-300",
  ],
  outline: [
    "bg-transparent transition-colors",
    "hover:bg-blue-200 hover:text-white",
    "active:bg-blue-300 active:transition-none",
    "border-1 border-blue-300 hover:border-blue-100 active:border-blue-300",
    "aria-disabled:text-gray-300 aria-disabled:before:border-gray-200",
    "py-[calc(0.5rem-1px)] px-[calc(1rem-1px)]",
  ],
  ghost: [
    "border-0 bg-gray-50 px-4 py-2 transition-colors",
    "hover:bg-blue-200 hover:text-white",
    "active:bg-blue-300 active:transition-none",
    "aria-disabled:bg-gray-100 aria-disabled:text-gray-300",
  ],
};

export function Button(
  props: {
    type?: "button" | "submit" | "reset";
    inert?: boolean;
    class?: string | string[];
    slot?: string;
    disabled?: boolean;
    autofocus?: boolean;
    variant?: keyof typeof buttonVariants;
    label?: string;
    onClick?: (e: MouseEvent) => void;
  },
  context,
) {
  return (
    <button
      type={props.type || "button"}
      inert={props.inert || undefined}
      // @ts-expect-error
      slot={props.slot || undefined}
      autofocus={props.autofocus || undefined}
      // the disabled attribute is not used for accessibility reasons
      aria-disabled={props.disabled || undefined}
      class={twJoin(
        buttonVariants.base,
        buttonVariants[props.variant ?? "default"],
        props.class,
      )}
      onClick={(e) => {
        if (props.disabled || props.onClick) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
        if (props.onClick && !props.disabled) {
          props.onClick(e);
        }
      }}
      title={props.label}
      aria-label={props.label}
    >
      {context?.slots.default?.()}
    </button>
  );
}

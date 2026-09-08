/* @jsxImportSource react */
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export const buttonVariants = {
  base: [
    "inline-flex items-center gap-1 rounded-md font-sans",
    "aria-disabled:pointer-events-none cursor-pointer",
    "outline-none focus-visible:ring focus-visible:ring-current",
  ],
  default: [
    "border-0 bg-gray-400 px-4 py-2 text-white transition-colors",
    "hover:bg-gray-200 hover:text-white",
    "active:bg-gray-300 active:transition-none",
    "aria-disabled:bg-gray-100 aria-disabled:text-gray-300",
  ],
  outline: [
    "bg-transparent transition-colors",
    "hover:bg-gray-200 hover:text-white",
    "active:bg-gray-300 active:transition-none",
    "border-1 border-gray-300 hover:border-gray-100 active:border-gray-300",
    "aria-disabled:text-gray-300 aria-disabled:before:border-gray-200",
    "py-[calc(0.5rem-1px)] px-[calc(1rem-1px)]",
  ],
  ghost: [
    "border-0 bg-gray-50 px-4 py-2 transition-colors",
    "hover:bg-gray-200 hover:text-white",
    "active:bg-gray-300 active:transition-none",
    "aria-disabled:bg-gray-100 aria-disabled:text-gray-300",
  ],
  disabled: ["cursor-not-allowed"],
};

export function Button(
  props: PropsWithChildren<{
    type?: "button" | "submit" | "reset";
    inert?: boolean;
    class?: string | string[];
    slot?: string;
    disabled?: boolean;
    variant?: keyof typeof buttonVariants;
    label?: string;
    onClick?: (e: React.MouseEvent) => void;
  }>,
) {
  return (
    <button
      type={props.type || "button"}
      // @ts-expect-error
      inert={props.inert || undefined}
      slot={props.slot || undefined}
      aria-disabled={props.disabled || undefined}
      className={twMerge(
        buttonVariants.base,
        buttonVariants[props.variant ?? "default"],
        props.class,
        // the disabled attribute is not used for accessibility reasons
        props.disabled && buttonVariants.disabled,
      )}
      onClick={(e) => {
        if (props.disabled || props.onClick) {
          e.preventDefault();
        }
        if (props.onClick && !props.disabled) {
          props.onClick(e);
        }
      }}
      title={props.label}
      aria-label={props.label}
    >
      {props.children}
    </button>
  );
}

export function Link(
  props: PropsWithChildren<{
    variant?: keyof Omit<typeof buttonVariants, "base">;
    href: string;
    target?: string;
  }>,
) {
  return (
    <a
      className={twMerge(
        "no-underline",
        buttonVariants.base,
        buttonVariants[props.variant ?? "default"],
      )}
      href={props.href}
      target={props.target}
    >
      {props.children}
    </a>
  );
}

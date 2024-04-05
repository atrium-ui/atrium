/* @jsxImportSource vue */

import { twMerge } from "tailwind-merge";

export const buttonVariants = {
  base: [
    "flex gap-2 items-center cursor-pointer leading-none",
    "rounded-lg px-4 py-2 transition-all active:transition-none",
    "outline-none focus-visible:ring focus-visible:ring-[currentColor]",
  ],
  default: [
    "bg-[var(--button-color,#bfa188)]",
    "filter hover:brightness-110 active:brightness-90 active:contrast-125",
    "border border-width-[var(--button-border-width,1px)] border-[var(--button-color,transparent)]",
  ],
  outline: [
    "bg-transparent hover:bg-[rgba(150,150,150,0.1)]",
    "filter hover:brightness-110 active:brightness-90 active:contrast-125",
    "border border-width-[var(--button-border-width,1px)] border-[var(--button-color,currentColor)]",
  ],
  ghost: [
    "bg-transparent active:bg-[rgba(150,150,150,0.1)]",
    "filter hover:brightness-110",
  ],
};

export function Button(
  props: {
    type?: "button" | "submit";
    class?: string;
    disabled?: boolean;
    variant?: keyof typeof buttonVariants;
    slot?: string;
    onClick?: (e: MouseEvent) => void;
  },
  { slots },
) {
  return (
    <button
      // @ts-ignore
      slot={props.slot}
      type={props.type || "button"}
      class={twMerge(
        buttonVariants.base,
        buttonVariants[props.variant ?? "default"],
        // the disabled prop is not used as attribute, for accessibility reasons
        props.disabled && "cursor-not-allowed opacity-80",
        props.class,
      )}
      onClick={(event) => {
        if (!props.disabled && props.onClick) props.onClick(event);
      }}
    >
      {slots.default?.()}
    </button>
  );
}

export function Link(
  props: {
    variant?: keyof Omit<typeof buttonVariants, "base">;
    href: string;
    target?: string;
  },
  { slots },
) {
  return (
    <a
      class={twMerge(
        "inline text-inherit no-underline",
        "transition-all active:transition-none",
        props.variant && buttonVariants.base,
        buttonVariants[props.variant ?? "default"],
      )}
      href={props.href}
      target={props.target}
    >
      {slots.default?.()}
    </a>
  );
}

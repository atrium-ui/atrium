/* @jsxImportSource vue */
import { twMerge } from "tailwind-merge";

export const buttonVariants = {
  base: [
    "flex cursor-pointer items-center gap-2 leading-none",
    "rounded-lg px-3 py-2 transition-all active:transition-none",
    "outline-none focus-visible:ring focus-visible:ring-[currentColor]",
  ],
  default: [
    "bg-[var(--button-color,#bfa188)]",
    "filter active:brightness-90 hover:brightness-110 active:contrast-125",
    "border border-[var(--button-color,#bfa188)] border-width-[var(--button-border-width,1px)]",
  ],
  outline: [
    "bg-transparent hover:bg-[rgba(150,150,150,0.1)]",
    "filter active:brightness-90 hover:brightness-110 active:contrast-125",
    "border border-[var(--button-color,currentColor)] border-width-[var(--button-border-width,1px)]",
  ],
  ghost: [
    "bg-transparent active:bg-[rgba(150,150,150,0.1)]",
    "filter hover:brightness-110",
  ],
};

export function Button(
  props: {
    type?: "button" | "submit";
    class?: string | string[];
    slot?: string;
    disabled?: boolean;
    autofocus?: boolean;
    variant?: keyof typeof buttonVariants;
    label?: string;
    onClick?: (e: MouseEvent) => void;
  },
  { slots },
) {
  return (
    <button
      type={props.type || "button"}
      // @ts-ignore
      slot={props.slot}
      autofocus={props.autofocus}
      class={twMerge(
        buttonVariants.base,
        buttonVariants[props.variant ?? "default"],
        // the disabled prop is not used as attribute, for accessibility reasons
        props.disabled && "cursor-not-allowed opacity-80",
        props.class,
      )}
      title={props.label}
      aria-label={props.label}
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
      class={[
        "inline text-inherit no-underline",
        "transition-all active:transition-none",
        props.variant && buttonVariants.base,
        buttonVariants[props.variant ?? "default"],
      ]}
      href={props.href}
      target={props.target}
    >
      {slots.default?.()}
    </a>
  );
}

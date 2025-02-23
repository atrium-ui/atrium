/* @jsxImportSource vue */
import { twMerge } from "tailwind-merge";

export const buttonVariants = {
  base: [
    "text-base leading-none",
    "flex cursor-pointer items-center gap-2",
    "rounded-lg px-3 py-2 transition-all active:transition-none",
    "outline-none focus-visible:ring focus-visible:ring-[currentColor]",
  ],
  default: [
    "bg-[var(--theme-color,#bfa188)] text-black",
    "filter active:brightness-90 hover:brightness-110 active:contrast-125",
    "border border-zinc-700",
  ],
  outline: [
    "bg-transparent hover:bg-[rgba(150,150,150,0.1)]",
    "filter active:brightness-90 hover:brightness-110 active:contrast-125",
    "border border-zinc-700",
  ],
  ghost: [
    "bg-transparent active:bg-[rgba(150,150,150,0.1)]",
    "filter hover:brightness-110",
  ],
  disabled: ["cursor-not-allowed opacity-50"],
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
      // @ts-ignore
      slot={props.slot || undefined}
      autofocus={props.autofocus || undefined}
      aria-disabled={props.disabled || undefined}
      class={twMerge(
        buttonVariants.base,
        buttonVariants[props.variant ?? "default"],
        props.class,
        // the disabled attribute is not used for accessibility reasons
        props.disabled && buttonVariants.disabled,
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

export function Link(
  props: {
    variant?: keyof Omit<typeof buttonVariants, "base">;
    href: string;
    target?: string;
  },
  context,
) {
  return (
    <a
      class={twMerge(
        "inline text-base leading-4 no-underline",
        "transition-all active:transition-none",
        props.variant && buttonVariants.base,
        buttonVariants[props.variant ?? "default"],
      )}
      href={props.href}
      target={props.target}
    >
      {context?.slots.default?.()}
    </a>
  );
}

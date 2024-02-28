const buttonVariants = {
  default: [
    "bg-[var(--button-color,#C09278)]",
    "filter hover:brightness-110 active:brightness-90 active:contrast-125",
    "border border-width-[var(--button-border-width,1px)] border-[var(--button-color,#C09278)]",
    "disabled:opacity-80 disabled:text-white disabled:filter-none",
  ].join(" "),
  outline: [
    "bg-transparent hover:bg-[rgba(150,150,150,0.1)]",
    "filter hover:brightness-110 active:brightness-90 active:contrast-125",
    "border border-width-[var(--button-border-width,1px)] border-[var(--button-color,#C09278)]",
    "disabled:opacity-80 disabled:text-white disabled:filter-none",
  ].join(" "),
  ghost: [
    "bg-transparent active:bg-[rgba(150,150,150,0.1)]",
    "filter hover:brightness-110",
    "disabled:opacity-80 disabled:text-white disabled:filter-none",
  ].join(" "),
};

export function Button(
  props: {
    type?: "button" | "submit";
    disabled?: boolean;
    children?: JSX.Element | string;
    variant?: keyof typeof buttonVariants;
    slot?: string;
    class?: string;
    onClick?: (e: PointerEvent) => void;
  },
  context,
) {
  const classes = [
    "flex gap-2 items-center cursor-pointer disabled:cursor-not-allowed",
    "px-5 py-1 rounded-lg transition-all active:transition-none",
    buttonVariants[props.variant ?? "default"],
    props.class,
  ].join(" ");

  return (
    <button
      type={props.type || "button"}
      slot={props.slot}
      disabled={props.disabled || undefined}
      class={classes}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

const linkVariants = {
  default: ["filter hover:brightness-110 active:brightness-90 active:contrast-125"].join(
    " ",
  ),
  button: [
    "text-white no-underline px-5 py-1 rounded-lg",
    "bg-[var(--button-color,#C09278)]",
    "filter hover:brightness-110 active:brightness-90 active:contrast-125",
    "border border-[var(--button-color,#C09278)]",
  ].join(" "),
  "button-outline": [
    "text-white no-underline px-5 py-1 rounded-lg",
    "bg-transparent hover:bg-[rgba(150,150,150,0.1)]",
    "filter hover:brightness-110 active:brightness-90 active:contrast-125",
    "border border-width-[var(--button-border-width,1px)] border-[var(--button-color,#C09278)]",
    "disabled:opacity-80 disabled:text-white disabled:filter-none",
  ].join(" "),
};

export function Link(
  props: {
    children?: JSX.Element | string;
    variant?: keyof typeof linkVariants;
    class?: string;
    href: string;
    target?: string;
  },
  context,
) {
  const slots = {
    default: () =>
      props.children
        ? props.children
        : context?.slots?.default
          ? context?.slots.default()
          : null,
  };

  const classes = [
    "inline cursor-pointer",
    "transition-all active:transition-none",
    linkVariants[props.variant ?? "default"],
    props.class,
  ].join(" ");

  return (
    <a class={classes} href={props.href} target={props.target}>
      <slots.default />
    </a>
  );
}

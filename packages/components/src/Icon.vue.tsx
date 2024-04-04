/* @jsxImportSource vue */

export function Icon(props: {
  name: keyof typeof ICONS;
}) {
  return (
    <span class={["relative bottom-[0.15em] inline-block align-middle leading-none"]}>
      {ICONS[props.name]}
    </span>
  );
}

const ICONS = {
  unknown: (
    <svg
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="h-[1em] w-[1em] align-middle"
    >
      <title>unknown</title>
      <path d="M2 32L32 2M2 2L32 32M1 1H33V33H1V1Z" stroke="currentColor" />
    </svg>
  ),
  collapse: (
    <svg
      viewBox="0 0 165 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="h-[1em] w-[1em] align-middle"
    >
      <title>collapse</title>
      <path
        d="M150 116L82 48L14 116"
        stroke="currentColor"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  expand: (
    <svg
      viewBox="0 0 165 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="h-[1em] w-[1em] align-middle"
    >
      <title>expand</title>
      <path
        d="M15 49L83 117L151 49"
        stroke="currentColor"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 17.121 13.141"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="h-[1em] w-[1em] align-middle"
    >
      <title>check</title>
      <path
        d="M683,754.437l5.041,5.041L698,749.518"
        transform="translate(-681.939 -748.457)"
        stroke="currentColor"
        fill="none"
        stroke-width="3"
      />
    </svg>
  ),
};

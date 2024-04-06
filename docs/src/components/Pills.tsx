/* @jsxImportSource vue */

export function Pills(_, { slots }) {
  return <div class="flex gap-2 pb-4">{slots.default?.()}</div>;
}

export function Pill(props: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={props.href}
      class="flex gap-1 rounded-lg bg-zinc-800 px-2 py-1 leading-none no-underline hover:bg-zinc-700"
    >
      <span class="align-bottom text-[#eee] text-xs">{props.label}</span>
    </a>
  );
}

export function Atrium(props: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={props.href}
      class="flex gap-1 rounded-lg bg-zinc-800 px-2 py-1 leading-none no-underline hover:bg-zinc-700"
    >
      <svg
        width="1em"
        height="1em"
        class="mb-[-0.15em] align-middle text-[#eee] text-[12px]"
        viewBox="0 0 442 442"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Atrium</title>
        <path
          d="M19.3639 388.943L181.816 114.631C184.511 110.08 191.35 110.99 192.761 116.088L219.32 212.041C219.754 213.612 219.531 215.293 218.702 216.696L113.242 395.054C112.162 396.88 110.199 398 108.077 398H24.5265C19.8781 398 16.9953 392.942 19.3639 388.943Z"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="2"
        />
        <path
          d="M168.256 287.437L137.381 339.437C135.007 343.436 137.889 348.5 142.54 348.5H249.139C253.097 348.5 255.971 344.735 254.927 340.917L240.708 288.917C239.995 286.309 237.625 284.5 234.92 284.5H173.415C171.298 284.5 169.337 285.616 168.256 287.437Z"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="2"
        />
        <path
          d="M228.613 47.0634L325.275 393.114C325.999 395.707 328.362 397.5 331.054 397.5H396.587C400.561 397.5 403.437 393.707 402.364 389.88L305.236 43.4098C304.506 40.8059 302.125 39.0121 299.42 39.0295L234.353 39.4493C230.397 39.4749 227.549 43.2538 228.613 47.0634Z"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
      <span class="align-bottom text-[#eee] text-xs">{props.label}</span>
    </a>
  );
}

export function Rive() {
  return (
    <a
      href="https://rive.app/"
      class="flex gap-2 rounded-lg bg-zinc-800 px-2 py-1 leading-none no-underline hover:bg-zinc-700"
    >
      <svg
        width="1em"
        height="1em"
        class="mb-[-0.15em] align-middle text-[#eee] text-[12px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 53 56"
        fill="none"
      >
        <title>Rive</title>
        <path
          fill="#fff"
          fill-rule="evenodd"
          d="M0 3.442c0 1.9 1.558 3.441 3.479 3.441H32.31c3.286 0 5.992 1.004 8.118 3.012 2.126 2.008 3.189 4.589 3.189 7.744 0 2.916-1.063 5.306-3.19 7.17-2.125 1.817-4.831 2.725-8.117 2.725H19.78c-1.922 0-3.48 1.54-3.48 3.442 0 1.9 1.558 3.441 3.48 3.441h13.836l12.466 19.79c.773 1.196 1.86 1.793 3.261 1.793 1.547 0 2.634-.597 3.262-1.793.628-1.242.507-2.557-.362-3.943l-11.09-17.64c2.996-1.338 5.364-3.298 7.103-5.879 1.74-2.629 2.61-5.664 2.61-9.106 0-3.49-.798-6.549-2.392-9.178-1.546-2.63-3.72-4.685-6.523-6.167C39.148.764 35.935 0 32.31 0H3.48C1.558 0 0 1.54 0 3.442z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="align-bottom text-[#eee] text-xs">Rive</span>
    </a>
  );
}

export function Lit() {
  return (
    <a
      href="https://lit.dev/"
      class="flex gap-2 rounded-lg bg-zinc-800 px-2 py-1 leading-none no-underline hover:bg-zinc-700"
    >
      <svg
        width="1em"
        height="1em"
        class="align-middle text-[#eee] text-[12px]"
        viewBox="0 0 160 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Lit</title>
        <g clip-path="url(#clip0_138_497)">
          <path d="M40 120L60 60L150 150L120 200L80 160H60" fill="#4D4D4D" />
          <path d="M40 200V120L80 160" fill="#9F9F9F" />
          <path d="M80 160V80L120 40V120M0 160L40 200V120H20" fill="white" />
          <path
            d="M40 120V40L80 0V80M120 200V120L160 80V160M0 160V80L40 120"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_138_497">
            <rect width="160" height="200" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <span class="align-bottom text-[#eee] text-xs">Lit</span>
    </a>
  );
}

export function Vue() {
  return (
    <a
      href="https://vuejs.org/"
      class="flex gap-2 rounded-lg bg-zinc-800 px-2 py-1 leading-none no-underline hover:bg-zinc-700"
    >
      <svg
        width="1em"
        height="1em"
        class="align-middle text-[#eee] text-[12px]"
        viewBox="0 0 24 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Vue</title>
        <path
          d="M14.775 0.875L12 5.6375L9.225 0.875H0L12 21.5L24 0.875H14.775Z"
          fill="#42B883"
        />
        <path
          d="M14.775 0.875L12 5.6375L9.22499 0.875H4.79999L12 13.25L19.2 0.875H14.775Z"
          fill="#35495E"
        />
      </svg>
      <span class="align-bottom text-[#eee] text-xs">Vue</span>
    </a>
  );
}

/* @jsxImportSource vue */

export function Icon(props: {
  name: keyof typeof ICONS;
}) {
  return (
    <span
      class={[
        "relative top-[0.15em] inline-block align-baseline leading-none [&>svg]:h-[1em] [&>svg]:w-[1em]",
      ]}
    >
      {ICONS[props.name]}
    </span>
  );
}

const ICONS = {
  unknown: (
    <svg viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>unknown</title>
      <path d="M2 32L32 2M2 2L32 32M1 1H33V33H1V1Z" stroke="currentColor" />
    </svg>
  ),
  collapse: (
    <svg viewBox="0 0 165 165" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg viewBox="0 0 165 165" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg viewBox="0 0 17.121 13.141" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  "arrow-left": (
    <svg viewBox="0 0 9 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>arrow-left</title>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.53558 0.553632C8.7912 0.806945 8.7912 1.21765 8.53558 1.47096L1.58023 8.36365L8.53558 15.2563C8.7912 15.5096 8.7912 15.9203 8.53558 16.1737C8.27997 16.427 7.86553 16.427 7.60992 16.1737L0.191734 8.82231C-0.0638818 8.569 -0.0638817 8.1583 0.191734 7.90498L7.60992 0.553632C7.86553 0.300319 8.27997 0.300319 8.53558 0.553632Z"
        fill="white"
      />
    </svg>
  ),
  "arrow-right": (
    <svg viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>arrow-right</title>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.191712 15.81C-0.063904 15.5567 -0.063904 15.146 0.191712 14.8927L7.14706 8L0.191712 1.10731C-0.0639038 0.853999 -0.0639038 0.443298 0.191712 0.189984C0.447328 -0.063329 0.861763 -0.063329 1.11738 0.189984L8.53556 7.54134C8.79118 7.79465 8.79118 8.20535 8.53556 8.45866L1.11738 15.81C0.861763 16.0633 0.447328 16.0633 0.191712 15.81Z"
        fill="white"
      />
    </svg>
  ),
};

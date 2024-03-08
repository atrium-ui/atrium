import "@sv/elements/expandable";
import "@sv/elements/toggle";

interface Props {
  children?: JSX.Element | string;
}

function CollapseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 165 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="align-middle"
    >
      <title>Collapse</title>
      <path
        d="M150 116L82 48L14 116"
        stroke="white"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 165 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="align-middle"
    >
      <title>Expand</title>
      <path
        d="M15 49L83 117L151 49"
        stroke="white"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function Accordion(props: Props, context) {
  const slots = {
    default: () =>
      props.children
        ? props.children
        : context?.slots?.default
          ? context?.slots.default()
          : null,
  };

  return (
    <ul class="m-0 list-none p-0">
      <slots.default />
    </ul>
  );
}

Accordion.Item = function AccordionItem(
  props: { title: string; children?: JSX.Element | string },
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

  return (
    <li class="list-none">
      <a-expandable class="group mb-2 rounded-lg border border-[#C09278]">
        <div
          slot="toggle"
          class="flex cursor-pointer items-center justify-between px-6 py-2"
        >
          <div class="text-white">
            <span>{props.title}</span>
          </div>

          <div class="block group-[[opened]]:hidden">
            <ExpandIcon />
          </div>
          <div class="hidden group-[[opened]]:block">
            <CollapseIcon />
          </div>
        </div>

        <div class="px-6 py-2">
          <slots.default />
        </div>
      </a-expandable>
    </li>
  );
};

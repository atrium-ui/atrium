/* @jsxImportSource vue */

import "@sv/elements/expandable";
import { defineComponent } from "vue";
import { Icon } from "./Icon.jsx";

export const Accordion = defineComponent((_, { slots }) => {
  return () => <ul class="m-0 list-none p-0">{slots.default?.()}</ul>;
});

export const AccordionItem = defineComponent(
  (props: { title: string; opened: boolean }, { slots }) => {
    return () => (
      <li class="list-none">
        <a-expandable
          opened={props.opened}
          class="group mb-2 block rounded-lg border border-[#C09278]"
        >
          <div
            // @ts-ignore
            slot="toggle"
            class="flex cursor-pointer items-center justify-between px-6 py-2"
          >
            <div class="text-white">
              <span>{props.title}</span>
            </div>

            <div class="block group-[[opened]]:hidden">
              <Icon name="expand" />
            </div>
            <div class="hidden group-[[opened]]:block">
              <Icon name="collapse" />
            </div>
          </div>

          <div class="px-6 py-2">{slots.default?.()}</div>
        </a-expandable>
      </li>
    );
  },
  {
    props: ["title"],
  },
);

/* @jsxImportSource vue */

import "@svp/elements/expandable";
import { defineComponent } from "vue";
import { Icon } from "./Icon.jsx";

export const Accordion = defineComponent((_, { slots }) => {
  const onChange = (e: Event) => {
    for (const expand of (e.currentTarget as HTMLElement).querySelectorAll(
      "a-expandable",
    )) {
      if (expand !== (e.target as HTMLElement)) expand.opened = false;
    }
  };

  return () => <div onChange={onChange}>{slots.default?.()}</div>;
});

export const AccordionItem = defineComponent(
  (props: { title: string; opened?: boolean }, { slots }) => {
    return () => (
      <a-expandable
        opened={props.opened}
        class="group mb-2 block rounded-lg border border-zinc-700"
      >
        <button
          // @ts-ignore
          slot="toggle"
          type="button"
          class="flex w-full cursor-pointer items-center justify-between bg-transparent px-6 py-2 active:bg-[rgba(150,150,150,0.1)] hover:bg-[rgba(150,150,150,0.0125)]"
        >
          <div class="text-left">{props.title}</div>

          <Icon class="block group-[[opened]]:hidden" name="expand" />
          <Icon class="hidden group-[[opened]]:block" name="collapse" />
        </button>

        <div class="px-6 py-2">{slots.default?.()}</div>
      </a-expandable>
    );
  },
  {
    props: ["title", "opened"],
  },
);

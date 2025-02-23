/* @jsxImportSource vue */
import "@atrium-ui/elements/expandable";
import { defineComponent } from "vue";
import { Icon } from "./Icon.jsx";

export const Accordion = defineComponent((_, { slots }) => {
  return () => <ul class="list-none p-0">{slots.default?.()}</ul>;
});

export const AccordionItem = defineComponent(
  (props: { title: string; opened?: boolean }, { slots }) => {
    return () => (
      <li>
        <a-expandable
          opened={props.opened}
          class="group mb-2 block rounded-lg border border-zinc-700"
        >
          <button
            // @ts-ignore
            slot="toggle"
            type="button"
            class={[
              "flex w-full cursor-pointer items-center justify-between rounded-lg bg-transparent px-4 py-2 hover:bg-[rgba(150,150,150,0.2)] active:bg-[rgba(150,150,150,0.1)]",
              "outline-none focus-visible:ring-2 focus-visible:ring-[currentColor]",
            ]}
          >
            <div class="text-left">{props.title}</div>

            <Icon class="block group-[[opened]]:hidden" name="expand" />
            <Icon class="hidden group-[[opened]]:block" name="collapse" />
          </button>

          <div class="px-4 pt-2 pb-4">{slots.default?.()}</div>
        </a-expandable>
      </li>
    );
  },
  {
    props: ["title", "opened"],
  },
);

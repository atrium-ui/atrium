import "@sv/elements/expandable";
import "@sv/svg-sprites/svg-icon";
import { defineComponent } from "vue";

export const Accordion = defineComponent((_, { slots }) => {
  return () => <ul class="flex list-none flex-col gap-3 p-0">{slots.default?.()}</ul>;
});

export const AccordionItem = defineComponent<{ title: string; opened?: boolean }>(
  (props, { slots }) => {
    return () => (
      <li>
        <a-expandable class="group block rounded-md bg-gray-100" opened={props.opened}>
          <button
            slot="toggle"
            type="button"
            class="flex w-full cursor-pointer items-center justify-between gap-x-6 px-3 py-3 text-left font-light text-xl italic md:px-4 md:py-5"
          >
            <div class="pointer-events-none max-w-[50rem]">
              <span>{props.title}</span>
            </div>
            <div>
              <svg-icon
                class="group-[[opened]]:-scale-100"
                name="chevron-down"
              ></svg-icon>
            </div>
          </button>
          <div class="px-3 pb-4 md:px-4 md:pb-6">
            <div>{slots.default?.()}</div>
          </div>
        </a-expandable>
      </li>
    );
  },
  {
    props: ["title", "opened"],
  },
);

/* @jsxImportSource vue */
import { Icon } from "@components/src/vue/Icon.jsx";
import type { Story } from "../../../components/stories/stories.js";

export default {
  tags: ["public"],
  args: {
    label: "Choose",
    data: [
      { title: "Test 1", url: "" },
      { title: "Test 2", url: "" },
    ]
  },
  argTypes: {},
} satisfies Story;

export const Default = {
  render: (args) => {
    return (
      <div class="flex max-w-full items-center justify-center pt-[50px] pb-[200px]">
        <a-popover-trigger class="w-full sm:w-auto">
          <button
            slot="trigger"
            class="w-full sm:w-auto cursor-pointer group text-left text-gray-900 rounded-md bg-white p-2 px-4 border border-gray-300 hover:bg-gray-200"
          >
            <a-box
              class="relative w-auto min-w-[180px] md:max-w-[300px]"
            >
              <span class="block flex-1">
                {args.label}
              </span>
            </a-box>
          </button>

          <a-popover class="group">
            <div
              class="group inline-block opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100 border border-gray-300 shadow-lg rounded-md bg-white my-1"
            >
              <a-list
                style={`width: ${210}px`}
                class="group scrollbar-thin scrollbar-transparent max-h-[300px] overflow-auto w-auto bg-white group-data-[placement=top]:rounded-t-md group-data-[placement=bottom]:rounded-b-md -translate-y-1 transition-all duration-150 group-[&[enabled]]:translate-y-0"
                onChange={(e: CustomEvent) => {
                  const option = e.detail.selected;
                  const link = option.querySelector("a[href]");
                  link?.click();
                }}
              >
                {args.data?.map((item) => {
                  return (
                    <a-list-item
                      class="group-focus-within:aria-selected:bg-blue-100 focus-within:bg-blue-100 mb-1 last:mb-0"
                    >
                      <a
                        tabindex="-1"
                        href={item.url}
                        class="block text-gray-900 hover:bg-blue-100 active:bg-blue-200 px-4 py-2 whitespace-nowrap text-ellipsis overflow-hidden"
                      >
                        {item.title}
                      </a>
                    </a-list-item>
                  );
                })}
              </a-list>
            </div>
          </a-popover>
        </a-popover-trigger>
      </div>
    );
  },
};

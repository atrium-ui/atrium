/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";

export default {
  tags: ["public"],
  args: {
    label: "Choose",
    data: [
      { title: "Test 1", url: "" },
      { title: "Test 2", url: "" },
    ],
  },
  argTypes: {},
} satisfies Story;

export const Default = {
  render: (args) => {
    return (
      <div class="flex max-w-full items-center justify-center pt-[50px] pb-[200px]">
        <a-popover-trigger class="w-full sm:w-auto">
          <button
            type="button"
            class="group w-full cursor-pointer rounded-md border border-gray-300 bg-white p-2 px-4 text-left text-gray-900 hover:bg-gray-200 sm:w-auto"
          >
            <a-box class="relative w-auto min-w-[180px] md:max-w-[300px]">
              <span class="block flex-1">{args.label}</span>
            </a-box>
          </button>

          <a-popover class="group">
            <div class="group my-1 inline-block rounded-md border border-gray-300 bg-white opacity-0 shadow-lg transition-opacity duration-100 group-[&[enabled]]:opacity-100">
              <a-list
                style={`width: ${210}px`}
                class="group scrollbar-thin scrollbar-transparent -translate-y-1 max-h-[300px] w-auto overflow-auto bg-white transition-all duration-150 group-[&[enabled]]:translate-y-0 group-data-[placement=top]:rounded-t-md group-data-[placement=bottom]:rounded-b-md"
                onChange={(e: CustomEvent) => {
                  const option = e.detail.selected;
                  const link = option.querySelector("a[href]");
                  link?.click();
                }}
              >
                {args.data?.map((item, index) => {
                  return (
                    <a-list-item
                      key={index}
                      class="mb-1 last:mb-0 focus-within:bg-blue-100 group-focus-within:aria-selected:bg-blue-100"
                    >
                      <a
                        tabindex="-1"
                        href={item.url}
                        class="block overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2 text-gray-900 hover:bg-blue-100 active:bg-blue-200"
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

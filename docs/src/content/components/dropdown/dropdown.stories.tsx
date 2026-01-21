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
        <a-popover-trigger class="w-auto">
          <button
            slot="trigger"
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
                class="group scrollbar-thin scrollbar-transparent -translate-y-1 max-h-[300px] w-auto overflow-auto overflow-hidden rounded-md bg-white transition-all duration-150 group-[&[enabled]]:translate-y-0"
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

const DropdownMenu = (props: {
  label: string;
  items: { title: string; url: string }[];
}) => (
  <a-popover-trigger class="w-auto">
    <button
      slot="trigger"
      type="button"
      class="group cursor-pointer rounded-md bg-transparent p-2 px-3 text-left text-gray-700 hover:bg-gray-100"
    >
      <span class="block">{props.label}</span>
    </button>

    <a-popover class="group">
      <div class="group my-1 inline-block rounded-md border border-gray-200 bg-white opacity-0 shadow-lg transition-opacity duration-100 group-[&[enabled]]:opacity-100">
        <a-list
          style="width: 180px"
          class="group scrollbar-thin scrollbar-transparent -translate-y-1 max-h-[300px] overflow-auto rounded-md bg-white transition-all duration-150 group-[&[enabled]]:translate-y-0"
        >
          {props.items.map((item, index) => (
            <a-list-item key={index} class="mb-1 last:mb-0 focus-within:bg-blue-100">
              <a
                tabindex="-1"
                href={item.url}
                class="block px-4 py-2 text-gray-900 hover:bg-blue-100"
              >
                {item.title}
              </a>
            </a-list-item>
          ))}
        </a-list>
      </div>
    </a-popover>
  </a-popover-trigger>
);

export const SettingsPanel = {
  render: () => {
    return (
      <div class="w-full bg-gray-50 p-6">
        <div class="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Header */}
          <div class="mb-6 flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-gray-200" />
            <div class="flex flex-col gap-1">
              <div class="h-5 w-32 rounded bg-gray-300" />
              <div class="h-3 w-48 rounded bg-gray-200" />
            </div>
          </div>

          {/* Divider */}
          <div class="mb-6 h-px w-full bg-gray-200" />

          {/* Settings rows */}
          <div class="flex flex-col gap-5">
            {/* Language setting */}
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <span class="font-medium text-gray-700 text-sm">Language</span>
                <span class="text-gray-500 text-xs">Select your preferred language</span>
              </div>
              <a-popover-trigger>
                <button
                  slot="trigger"
                  type="button"
                  class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 text-sm hover:bg-gray-50"
                >
                  <span>English</span>
                  <span class="text-gray-400">▼</span>
                </button>
                <a-popover class="group" placements="bottom-end,top-end">
                  <div class="group my-1 inline-block rounded-md border border-gray-200 bg-white opacity-0 shadow-lg transition-opacity duration-100 group-[&[enabled]]:opacity-100">
                    <a-list
                      style="width: 150px"
                      class="group -translate-y-1 max-h-[200px] overflow-auto rounded-md bg-white transition-all duration-150 group-[&[enabled]]:translate-y-0"
                    >
                      {["English", "Deutsch", "Français", "Español"].map((lang, i) => (
                        <a-list-item key={i} class="focus-within:bg-blue-100">
                          <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-gray-900 hover:bg-blue-100"
                          >
                            {lang}
                          </button>
                        </a-list-item>
                      ))}
                    </a-list>
                  </div>
                </a-popover>
              </a-popover-trigger>
            </div>

            {/* Timezone setting */}
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <span class="font-medium text-gray-700 text-sm">Timezone</span>
                <span class="text-gray-500 text-xs">Set your local timezone</span>
              </div>
              <a-popover-trigger>
                <button
                  slot="trigger"
                  type="button"
                  class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 text-sm hover:bg-gray-50"
                >
                  <span>UTC+0</span>
                  <span class="text-gray-400">▼</span>
                </button>
                <a-popover class="group" placements="bottom-end,top-end">
                  <div class="group my-1 inline-block rounded-md border border-gray-200 bg-white opacity-0 shadow-lg transition-opacity duration-100 group-[&[enabled]]:opacity-100">
                    <a-list
                      style="width: 180px"
                      class="group -translate-y-1 max-h-[200px] overflow-auto rounded-md bg-white transition-all duration-150 group-[&[enabled]]:translate-y-0"
                    >
                      {[
                        "UTC-8 Pacific",
                        "UTC-5 Eastern",
                        "UTC+0 London",
                        "UTC+1 Berlin",
                        "UTC+9 Tokyo",
                      ].map((tz, i) => (
                        <a-list-item key={i} class="focus-within:bg-blue-100">
                          <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-gray-900 hover:bg-blue-100"
                          >
                            {tz}
                          </button>
                        </a-list-item>
                      ))}
                    </a-list>
                  </div>
                </a-popover>
              </a-popover-trigger>
            </div>

            {/* Theme skeleton row */}
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <div class="h-4 w-16 rounded bg-gray-300" />
                <div class="h-3 w-36 rounded bg-gray-200" />
              </div>
              <div class="h-9 w-24 rounded-md bg-gray-200" />
            </div>

            {/* Notifications skeleton row */}
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <div class="h-4 w-24 rounded bg-gray-300" />
                <div class="h-3 w-44 rounded bg-gray-200" />
              </div>
              <div class="h-6 w-11 rounded-full bg-gray-200" />
            </div>
          </div>

          {/* Divider */}
          <div class="my-6 h-px w-full bg-gray-200" />

          {/* Save button skeleton */}
          <div class="h-10 w-full rounded-lg bg-gray-300" />
        </div>
      </div>
    );
  },
};

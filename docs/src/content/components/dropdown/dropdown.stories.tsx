/* @jsxImportSource vue */
import type { Story } from "@atrium-ui/astro-stories";
import "@atrium-ui/elements/box";
import "@atrium-ui/elements/list";
import "@atrium-ui/elements/popover";
import Dropdown from "@components/src/vue/Dropdown.vue";
import DropdownItem from "@components/src/vue/DropdownItem.vue";
import DropdownSeparator from "@components/src/vue/DropdownSeparator.vue";

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
        <Dropdown label={args.label} placements="bottom-start,top-start">
          {args.data?.map((item, index) => (
            <DropdownItem key={index} href={item.url}>
              {item.title}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>
    );
  },
};

const ICONS: Record<string, string> = {
  share:
    "M7 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8.7 11 15.3 8M8.7 13l6.6 3",
  activity: "M12 21a9 9 0 1 0-9-9M12 7v5l3 2M3 12l-2-2m2 2 2-2",
  agent: "M4 6h16v10H4zM9 20h6M12 16v4M9 10h.01M15 10h.01",
  duplicate: "M9 9h10v10H9zM5 15V5h10",
  image: "M4 5h16v14H4zM4 15l4-4 5 5M14 13l2-2 4 4M15 9h.01",
  mute: "M6 9a6 6 0 0 1 9-5M18 10v4l2 3H8M10 20h4M4 4l16 16",
  print: "M7 9V4h10v5M7 17H5v-6h14v6h-2M8 14h8v6H8z",
  archive: "M4 4h16v4H4zM6 8v12h12V8M10 12h4",
};

const MenuIcon = (props: { name: keyof typeof ICONS }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={ICONS[props.name]}
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const Menu = {
  render: () => {
    return (
      <div class="flex max-w-full items-center justify-center pt-[50px] pb-[280px]">
        <Dropdown label="Document" placements="bottom-start,top-start" width="260px">
          <DropdownItem v-slots={{ icon: () => <MenuIcon name="share" /> }}>
            Share
          </DropdownItem>
          <DropdownItem
            shortcut="⌘ L"
            v-slots={{ icon: () => <MenuIcon name="activity" /> }}
          >
            Activity
          </DropdownItem>
          <DropdownItem v-slots={{ icon: () => <MenuIcon name="agent" /> }}>
            Agent
          </DropdownItem>

          <DropdownSeparator />

          <DropdownItem v-slots={{ icon: () => <MenuIcon name="duplicate" /> }}>
            Duplicate Document
          </DropdownItem>
          <DropdownItem v-slots={{ icon: () => <MenuIcon name="image" /> }}>
            Add header image
          </DropdownItem>
          <DropdownItem v-slots={{ icon: () => <MenuIcon name="mute" /> }}>
            Mute email notifications
          </DropdownItem>
          <DropdownItem v-slots={{ icon: () => <MenuIcon name="print" /> }}>
            Print
          </DropdownItem>

          <DropdownSeparator />

          <DropdownItem danger v-slots={{ icon: () => <MenuIcon name="archive" /> }}>
            Archive Document
          </DropdownItem>
        </Dropdown>
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

export const LandingPage = {
  render: () => {
    return (
      <div class="h-full p-3">
        <div class="grid h-full content-start gap-3 border border-zinc-200 bg-white p-3">
          <div class="flex items-start justify-between">
            <div>
              <div class="mb-1 text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                Dropdown
              </div>
              <div class="text-sm text-zinc-700">
                Switch between compact workspace presets.
              </div>
            </div>

            <a-popover-trigger class="w-auto">
              <button
                slot="trigger"
                type="button"
                class="border border-zinc-200 px-3 py-2 text-xs text-zinc-600 uppercase tracking-[0.16em]"
              >
                Preset
              </button>

              <a-popover class="group">
                <div class="my-1 inline-block border border-zinc-200 bg-white opacity-0 transition-opacity group-[&[enabled]]:opacity-100">
                  <a-list class="w-[12rem] bg-white">
                    {["Overview", "Assets"].map((item, index) => (
                      <a-list-item key={index}>
                        <button
                          type="button"
                          class="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                        >
                          {item}
                        </button>
                      </a-list-item>
                    ))}
                  </a-list>
                </div>
              </a-popover>
            </a-popover-trigger>
          </div>

          <div class="grid gap-2">
            <div class="h-9 border border-zinc-200 bg-zinc-50" />
            <div class="h-9 border border-zinc-200 bg-zinc-50" />
          </div>
        </div>
      </div>
    );
  },
};

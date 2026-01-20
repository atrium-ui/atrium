/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Datepicker } from "@components/src/vue";
import { ref } from "vue";
import "@sv/elements/calendar";

export default {
  tags: ["public"],
  args: {
    count: 5,
  },
  argTypes: {
    count: {
      description: "Number of slides",
    },
  },
} satisfies Story;

export const Default = {
  render: () => {
    return (
      <div class="flex max-w-full items-center justify-center pt-[50px] pb-[300px]">
        <Datepicker
          onChange={(ev) => {
            console.info(ev.detail.date);
          }}
        />
      </div>
    );
  },
};

export const FilterableSidebar = {
  render: () => {
    return (
      <div class="flex w-full gap-6 bg-gray-50 p-6">
        {/* Sidebar filters */}
        <div class="w-64 shrink-0">
          <div class="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-4">
            {/* Search skeleton */}
            <div class="flex flex-col gap-2">
              <div class="h-4 w-16 rounded bg-gray-300" />
              <div class="h-10 w-full rounded bg-gray-200" />
            </div>

            {/* Date filter skeleton */}
            <div class="flex flex-col gap-2">
              <a-calendar mode="range" value="" />
            </div>

            {/* Category filter skeleton */}
            <div class="flex flex-col gap-2">
              <div class="h-4 w-20 rounded bg-gray-300" />
              <div class="flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} class="flex items-center gap-2">
                    <div class="h-4 w-4 rounded bg-gray-200" />
                    <div class="h-3 w-24 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div class="flex-1">
          {/* Header and sort row */}
          <div class="mb-4 flex items-center justify-between">
            <div class="h-6 w-32 rounded bg-gray-300" />
            <div class="h-8 w-36 rounded bg-gray-200" />
          </div>

          {/* Product grid */}
          <div class="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} class="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3">
                <div class="h-32 w-full rounded bg-gray-200" />
                <div class="h-4 w-3/4 rounded bg-gray-300" />
                <div class="h-3 w-1/2 rounded bg-gray-200" />
                <div class="h-4 w-16 rounded bg-gray-300" />
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div class="mt-6 flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} class="h-8 w-8 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const BookingForm = {
  render: () => {
    const checkInDate = ref<Date | null>(null);
    const checkOutDate = ref<Date | null>(null);

    return (
      <div class="min-h-[600px] w-full bg-gray-50 p-6">
        {/* Card container */}
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm max-w-[540px] mx-auto">
          {/* Header */}
          <div class="mb-6 flex items-center gap-3">
            <div class="h-12 w-12 rounded-full bg-gray-200" />
            <div class="flex flex-col gap-1">
              <div class="h-5 w-40 rounded bg-gray-300" />
              <div class="h-3 w-24 rounded bg-gray-200" />
            </div>
          </div>

          {/* Divider */}
          <div class="mb-6 h-px w-full bg-gray-200" />

          {/* Form fields */}
          <div class="flex flex-col gap-5">
            {/* Guest count skeleton */}
            <div class="flex flex-col gap-2">
              <div class="h-4 w-20 rounded bg-gray-200" />
              <div class="h-10 w-full rounded bg-gray-100" />
            </div>

            {/* Date pickers row */}
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-gray-700">Check-in</span>
                <Datepicker
                  onChange={(ev) => {
                    checkInDate.value = ev.detail.date;
                  }}
                />
              </div>
              <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-gray-700">Check-out</span>
                <Datepicker
                  onChange={(ev) => {
                    checkOutDate.value = ev.detail.date;
                  }}
                />
              </div>
            </div>

            {/* Special requests skeleton */}
            <div class="flex flex-col gap-2">
              <div class="h-4 w-32 rounded bg-gray-200" />
              <div class="h-24 w-full rounded bg-gray-100" />
            </div>
          </div>

          {/* Divider */}
          <div class="my-6 h-px w-full bg-gray-200" />

          {/* Price summary skeleton */}
          <div class="mb-6 flex flex-col gap-2">
            <div class="flex justify-between">
              <div class="h-4 w-24 rounded bg-gray-200" />
              <div class="h-4 w-16 rounded bg-gray-200" />
            </div>
            <div class="flex justify-between">
              <div class="h-4 w-20 rounded bg-gray-200" />
              <div class="h-4 w-12 rounded bg-gray-200" />
            </div>
            <div class="flex justify-between">
              <div class="h-5 w-16 rounded bg-gray-300" />
              <div class="h-5 w-20 rounded bg-gray-300" />
            </div>
          </div>

          {/* Submit button skeleton */}
          <div class="h-12 w-full rounded-lg bg-gray-300" />
        </div>
      </div>
    );
  },
};

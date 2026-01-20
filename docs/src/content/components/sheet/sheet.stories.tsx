/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Button } from "@components/src/vue";
import { Sheet } from "@components/src/vue";

export default {
  tags: ["public"],
  args: {},
  argTypes: {},
} satisfies Story;

export const Default = {
  render: () => {
    return (
      <div class="flex min-h-[400px] items-center justify-center">
        <Sheet>
          <div class="flex flex-col gap-4">
            <div class="text-lg font-medium">Sheet Content</div>
            <p class="text-gray-600">This is a sheet panel that slides in from the right.</p>
            <div onclick="document.querySelector('#sheet').enabled = false">
              <Button>Close</Button>
            </div>
          </div>
        </Sheet>

        <div onclick="document.querySelector('#sheet').enabled = true">
          <Button>Open Sheet</Button>
        </div>
      </div>
    );
  },
};

export const MobileNavigation = {
  render: () => {
    return (
      <div class="min-h-[400px] w-full bg-gray-50">
        {/* Header bar */}
        <div class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          {/* Logo skeleton */}
          <div class="h-8 w-24 rounded bg-gray-300" />

          {/* Desktop nav skeleton - hidden on mobile */}
          <div class="hidden items-center gap-4 md:flex">
            <div class="h-4 w-16 rounded bg-gray-200" />
            <div class="h-4 w-16 rounded bg-gray-200" />
            <div class="h-4 w-16 rounded bg-gray-200" />
          </div>

          {/* Mobile burger menu button */}
          <div class="md:hidden" onclick="document.querySelector('#sheet').enabled = true">
            <Button variant="ghost">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Page content skeleton */}
        <div class="p-6">
          <div class="mb-4 h-8 w-48 rounded bg-gray-300" />
          <div class="mb-2 h-4 w-full max-w-md rounded bg-gray-200" />
          <div class="mb-2 h-4 w-full max-w-sm rounded bg-gray-200" />
          <div class="h-4 w-3/4 max-w-xs rounded bg-gray-200" />
        </div>

        {/* Sheet with mobile navigation */}
        <Sheet>
          <div class="flex flex-col gap-6">
            {/* Close button */}
            <div class="flex justify-end" onclick="document.querySelector('#sheet').enabled = false">
              <Button variant="ghost">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Navigation links */}
            <nav class="flex flex-col gap-2">
              <a href="#" class="rounded-lg px-4 py-3 text-gray-900 hover:bg-gray-200">Home</a>
              <a href="#" class="rounded-lg px-4 py-3 text-gray-900 hover:bg-gray-200">Products</a>
              <a href="#" class="rounded-lg px-4 py-3 text-gray-900 hover:bg-gray-200">About</a>
              <a href="#" class="rounded-lg px-4 py-3 text-gray-900 hover:bg-gray-200">Contact</a>
            </nav>

            {/* Divider */}
            <div class="h-px w-full bg-gray-300" />

            {/* User section skeleton */}
            <div class="flex items-center gap-3 px-4">
              <div class="h-10 w-10 rounded-full bg-gray-300" />
              <div class="flex flex-col gap-1">
                <div class="h-4 w-24 rounded bg-gray-300" />
                <div class="h-3 w-32 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </Sheet>
      </div>
    );
  },
};

export const FilterPanel = {
  render: () => {
    return (
      <div class="min-h-[500px] w-full bg-gray-50">
        {/* Toolbar */}
        <div class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div class="h-6 w-32 rounded bg-gray-300" />

          <div class="flex items-center gap-3">
            {/* Sort skeleton */}
            <div class="h-9 w-28 rounded bg-gray-200" />

            {/* Filter button */}
            <div onclick="document.querySelector('#sheet').enabled = true">
              <Button variant="outline">
                <span class="flex items-center gap-2">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Product grid skeleton */}
        <div class="grid grid-cols-2 gap-4 p-4 md:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} class="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3">
              <div class="h-32 w-full rounded bg-gray-200" />
              <div class="h-4 w-3/4 rounded bg-gray-300" />
              <div class="h-3 w-1/2 rounded bg-gray-200" />
              <div class="h-4 w-16 rounded bg-gray-300" />
            </div>
          ))}
        </div>

        {/* Sheet with filters */}
        <Sheet>
          <div class="flex flex-col gap-6">
            {/* Header */}
            <div class="flex items-center justify-between">
              <span class="text-lg font-medium">Filters</span>
              <div onclick="document.querySelector('#sheet').enabled = false">
                <Button variant="ghost" size="sm">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Category filter */}
            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-gray-700">Category</span>
              <div class="flex flex-col gap-2">
                {["Electronics", "Clothing", "Home & Garden", "Sports"].map((cat, i) => (
                  <label key={i} class="flex items-center gap-2">
                    <input type="checkbox" class="h-4 w-4 rounded border-gray-300" />
                    <span class="text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price range skeleton */}
            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-gray-700">Price Range</span>
              <div class="h-2 w-full rounded bg-gray-200" />
              <div class="flex justify-between">
                <span class="text-xs text-gray-500">$0</span>
                <span class="text-xs text-gray-500">$500</span>
              </div>
            </div>

            {/* Rating filter skeleton */}
            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-gray-700">Rating</span>
              <div class="flex flex-col gap-2">
                {[5, 4, 3, 2].map((stars) => (
                  <label key={stars} class="flex items-center gap-2">
                    <input type="checkbox" class="h-4 w-4 rounded border-gray-300" />
                    <div class="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} class={`h-4 w-4 rounded ${i < stars ? "bg-yellow-400" : "bg-gray-200"}`} />
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply button */}
            <div class="mt-auto pt-4">
              <div onclick="document.querySelector('#sheet').enabled = false">
                <Button class="w-full">Apply Filters</Button>
              </div>
            </div>
          </div>
        </Sheet>
      </div>
    );
  },
};

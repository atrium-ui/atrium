/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Button } from "@components/src/vue";
import { ref, computed } from "vue";
import "@sv/elements/transition";

export default {
  tags: ["public"],
  args: {},
} satisfies Story;

const ITEMS = [
  { id: 1, label: "Plan", color: "bg-violet-100 text-violet-800" },
  { id: 2, label: "Design", color: "bg-blue-100 text-blue-800" },
  { id: 3, label: "Develop", color: "bg-cyan-100 text-cyan-800" },
  { id: 4, label: "Review", color: "bg-amber-100 text-amber-800" },
  { id: 5, label: "Test", color: "bg-orange-100 text-orange-800" },
  { id: 6, label: "Deploy", color: "bg-green-100 text-green-800" },
];

export const Default = {
  render: () => {
    const items = ref([...ITEMS]);

    const shuffle = () => {
      items.value = [...items.value].sort(() => Math.random() - 0.5);
    };

    return () => (
      <div class="flex min-h-[280px] flex-col items-center justify-center gap-6 p-6">
        <Button variant="outline" onClick={shuffle}>
          Shuffle
        </Button>
        <a-transition style="transition-duration: 400ms; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; width: 100%; max-width: 420px;">
          {items.value.map((item) => (
            <div
              key={item.id}
              data-key={item.id}
              class={`${item.color} rounded-lg px-4 py-3 text-center font-medium text-sm`}
            >
              {item.label}
            </div>
          ))}
        </a-transition>
      </div>
    );
  },
};

const TASKS = [
  { id: 1, title: "Update landing page copy", tag: "content" },
  { id: 2, title: "Fix nav mobile breakpoint", tag: "bug" },
  { id: 3, title: "Add dark mode support", tag: "feature" },
  { id: 4, title: "Write unit tests for auth", tag: "testing" },
  { id: 5, title: "Optimise image loading", tag: "performance" },
  { id: 6, title: "Fix form validation errors", tag: "bug" },
  { id: 7, title: "Improve a11y on dialog", tag: "feature" },
  { id: 8, title: "Update dependencies", tag: "maintenance" },
];

const TAG_COLORS: Record<string, string> = {
  content: "bg-violet-100 text-violet-700",
  bug: "bg-red-100 text-red-700",
  feature: "bg-blue-100 text-blue-700",
  testing: "bg-amber-100 text-amber-700",
  performance: "bg-green-100 text-green-700",
  maintenance: "bg-zinc-100 text-zinc-700",
};

export const TaskList = {
  render: () => {
    const filter = ref("all");
    const tags = ["all", ...new Set(TASKS.map((t) => t.tag))];
    const filtered = computed(() =>
      filter.value === "all" ? TASKS : TASKS.filter((t) => t.tag === filter.value),
    );

    return () => (
      <div class="flex min-h-[420px] w-full max-w-xl flex-col gap-4 p-6">
        <div class="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => {
                filter.value = tag;
              }}
              class={`rounded-full px-3 py-1 text-sm capitalize transition-colors ${
                filter.value === tag
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <a-transition animate-enter animate-exit style="transition-duration: 300ms;">
          {filtered.value.map((task) => (
            <div
              key={task.id}
              data-key={task.id}
              class="mb-2 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
            >
              <span class="text-sm text-zinc-800">{task.title}</span>
              <span
                class={`rounded-full px-2 py-0.5 font-medium text-xs capitalize ${TAG_COLORS[task.tag]}`}
              >
                {task.tag}
              </span>
            </div>
          ))}
        </a-transition>
      </div>
    );
  },
};

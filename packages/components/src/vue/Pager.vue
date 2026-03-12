<script setup lang="ts">
import "@sv/elements/pager";
import { ref } from "vue";
import Button from "./Button.vue";

const props = defineProps<{
  page?: number;
  count?: number;
  url?: string;
  query?: string;
}>();

const emit = defineEmits<{
  change: [e: CustomEvent<{ page: number; url: string }>];
}>();

const params = new URLSearchParams(location.search);
const pageParam = params.get("page");

const currentPage = ref(pageParam ? Number.parseInt(pageParam) : props.page);

function onPageChange(e: Event) {
  const detail = (e as CustomEvent<{ page: number; url: string }>).detail;
  currentPage.value = detail.page;
  emit("change", e as CustomEvent<{ page: number; url: string }>);
}
</script>

<template>
  <a-pager
    class="pager-sv"
    :page="currentPage"
    :count="count ?? 1"
    :url="url"
    :query="query"
    @change="onPageChange"
  >
    <Button slot="prev" variant="ghost" :disabled="currentPage <= 1">←</Button>
    <Button slot="next" variant="ghost" :disabled="currentPage >= (count ?? 1)">→</Button>
  </a-pager>
</template>

<style>
.pager-sv {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pager-sv::part(pages) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pager-sv::part(page) {
  box-sizing: border-box;
  min-width: 2rem;
  padding: calc(0.5rem - 1px) calc(1rem - 1px);
  border-radius: 0.375rem;
  border: 1px solid var(--color-gray-300);
  background: transparent;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  text-align: center;
  transition: background 100ms, color 100ms;
}

.pager-sv::part(page):hover {
  background: var(--color-gray-100);
  color: var(--color-gray-900);
}

.pager-sv::part(page active) {
  background: var(--color-gray-900);
  border-color: var(--color-gray-900);
  color: white;
}

.pager-sv::part(ellipsis) {
  min-width: 2rem;
  text-align: center;
  color: var(--color-gray-300);
}
</style>

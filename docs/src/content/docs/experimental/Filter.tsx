import { Filter, FilterItem } from "@sv/components/src/vue/Filter";

export default function () {
  return (
    <Filter value="">
      <FilterItem value="Item1" />
      <FilterItem value="Item2" />
      <FilterItem value="Item3" />
      <hr class="mx-1 my-1 h-[1px] w-full bg-white opacity-20" />
      <FilterItem value="Item4" />
      <FilterItem value="Item5" />
    </Filter>
  );
}

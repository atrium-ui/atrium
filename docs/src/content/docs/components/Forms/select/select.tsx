/* @jsxImportSource vue */
import { Select, SelectItem } from "@components/src/vue/Select";

export default function () {
  return (
    <div class="max-w-[300px]">
      <Select name="select" placeholder="Select">
        <SelectItem value="Item 1" />
        <SelectItem value="Item 2" />
        <SelectItem value="Item 3" />
      </Select>
    </div>
  );
}

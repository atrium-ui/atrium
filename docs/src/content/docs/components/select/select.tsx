/* @jsxImportSource vue */
import { Select, SelectItem } from "@components/src/vue/Select";

export default function () {
  return (
    <Select name="select" placeholder="Select">
      <SelectItem value="Item 1" />
      <SelectItem value="Item 2" />
      <SelectItem value="Item 3" />
    </Select>
  );
}

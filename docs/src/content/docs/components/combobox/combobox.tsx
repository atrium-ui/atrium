/* @jsxImportSource vue */
import { Combobox, ComboboxItem } from "@components/src/vue/Combobox";

export default function () {
  return (
    <div class="max-w-[300px]">
      <Combobox name="combobox" placeholder="Select">
        <ComboboxItem value="Item 1" />
        <ComboboxItem value="Item 2" />
        <ComboboxItem value="Item 3" />
      </Combobox>
    </div>
  );
}

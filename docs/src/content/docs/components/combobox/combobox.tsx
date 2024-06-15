/* @jsxImportSource vue */
import { Combobox, ComboboxItem } from "@components/src/vue/Combobox";

export default function () {
  return (
    <Combobox value="Select">
      <ComboboxItem value="Item 1" />
      <ComboboxItem value="Item 2" />
      <ComboboxItem value="Item 3" />
    </Combobox>
  );
}

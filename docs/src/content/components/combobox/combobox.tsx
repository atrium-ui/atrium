/* @jsxImportSource vue */
import { Combobox, ComboboxItem } from "@components/src/vue/Combobox";
import { defineComponent } from "vue";

export default defineComponent(() => {
  return () => (
    <div class="max-w-[700px]">
      <Combobox
        name="combobox"
        placeholder="Select"
        options={[
          { label: "Item 1", value: "item-1" },
          { label: "Item 2", value: "item-2" },
          { label: "Item 3", value: "item-3" },
        ]}
      />
    </div>
  );
});

/* @jsxImportSource vue */
import { Combobox } from "@components/src/vue";
import { defineComponent } from "vue";

export default defineComponent(() => {
  return () => (
    <div class="min-h-[200px] max-w-[700px]">
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

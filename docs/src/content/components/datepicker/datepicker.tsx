/* @jsxImportSource vue */
import { Datepicker } from "@components/src/vue/Datepicker";
import { defineComponent } from "vue";

export default defineComponent(() => {
  return () => (
    <div class="max-w-[300px]">
      <Datepicker
        onChange={(ev) => {
          console.info(ev.detail.date);
        }}
      />
    </div>
  );
});

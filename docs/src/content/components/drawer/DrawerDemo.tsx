/* @jsxImportSource vue */

import { ref, defineComponent } from "vue";
import { Drawer } from "@components/src/vue/Drawer";
import { paragraph } from "txtgen";

export const DrawerDemo = defineComponent(() => {
  const text = ref("");

  const next = () => {
    text.value = paragraph(1 + Math.random() * 5);
  };

  next();

  return () => (
    <Drawer dynamicHeight>
      <div class="px-6 pt-4 pb-12">
        <p>{text.value}</p>
      </div>
    </Drawer>
  );
});

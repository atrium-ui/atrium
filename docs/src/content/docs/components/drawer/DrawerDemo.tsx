/* @jsxImportSource vue */

import { ref, defineComponent } from "vue";
import { Drawer } from "@sv/components/src/vue/Drawer.jsx";
import { paragraph } from "txtgen";

export const DrawerDemo = defineComponent(() => {
  const text = ref("");

  const next = () => {
    text.value = paragraph(1 + Math.random() * 5);
  };

  next();

  return () => (
    <Drawer>
      <div class="px-6 pt-4">
        <p>{text.value}</p>
      </div>
    </Drawer>
  );
});

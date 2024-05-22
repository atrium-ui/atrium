/* @jsxImportSource vue */

import { ref, defineComponent } from "vue";
import { Button } from "@svp/components/src/vue/Button.jsx";
import { Drawer } from "@svp/components/src/vue/Drawer.jsx";
import "@svp/elements/adaptive";
import { paragraph } from "txtgen";

export const DrawerDemo = defineComponent(() => {
  const text = ref("");

  const next = () => {
    text.value = paragraph(1 + Math.random() * 5);
  };

  next();

  return () => (
    <div>
      <Drawer>
        <div class="px-4">
          <a-adaptive class="overflow-hidden">
            <p>{text.value}</p>
          </a-adaptive>

          <div class="flex justify-end pt-10">
            <Button variant="outline" onClick={() => next()}>
              Next
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
});

/* @jsxImportSource vue */

import { Button } from "@sv/components/src/Button.vue.jsx";
import { Drawer } from "@sv/components/src/Drawer.vue.jsx";
import "@sv/elements/adaptive";
import { createSignal } from "solid-js";
import { paragraph } from "txtgen";

export function DrawerDemo() {
  const [open, setOpen] = createSignal(false);
  const [text, setText] = createSignal("");

  const toggle = () => setOpen(!open());
  const next = () => {
    const text = paragraph(1 + Math.random() * 5);
    setText(text);
  };

  next();

  return (
    <div>
      <Drawer enabled={open()} onBlur={() => setOpen(false)}>
        <a-adaptive class="overflow-hidden">
          <p>{text()}</p>
        </a-adaptive>

        <div class="flex justify-end pt-10">
          <Button variant="outline" onClick={() => next()}>
            Next
          </Button>
        </div>
      </Drawer>

      <div>
        <Button onClick={() => toggle()}>Open</Button>
      </div>
    </div>
  );
}
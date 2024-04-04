/* @jsxImportSource vue */

import { Button } from "@sv/components/src/Button.vue.jsx";
import { Toasts } from "@sv/elements/toast";

export function ToastButton() {
  return (
    <div>
      <Button
        onClick={() => {
          Toasts.info("Hello, World!");
        }}
      >
        Click
      </Button>

      <a-toast-feed />
    </div>
  );
}

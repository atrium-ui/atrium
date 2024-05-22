/* @jsxImportSource vue */

import { Button } from "@svp/components/src/vue/Button.jsx";
import { Toasts } from "@svp/elements/toast";

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

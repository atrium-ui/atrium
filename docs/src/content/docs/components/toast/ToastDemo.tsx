/* @jsxImportSource vue */
import "@sv/elements/portal";
import { Button } from "@components/src/vue/Button";
import { Toasts, toast } from "@components/src/vue/Toasts";
import { paragraph } from "txtgen";

export function ToastDemo() {
  return (
    <div>
      <Button
        onClick={() => {
          toast({
            message: paragraph(1),
            time: Math.random() * 10000,
          });
        }}
      >
        Show Toast
      </Button>

      <Toasts />
    </div>
  );
}

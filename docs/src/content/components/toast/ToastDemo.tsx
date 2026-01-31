/* @jsxImportSource vue */
import "@sv/elements/portal";
import { Button } from "@components/src/vue";
import { Toasts, toast } from "@components/src/vue";
import { paragraph } from "txtgen";

export function ToastDemo() {
  return (
    <div>
      <Button
        onClick={() => {
          toast({
            message: paragraph(1),
            time: Math.random() * 10000,
            icon: "atrium",
            button: {
              label: "Click here",
              onClick: () => {
                console.info("clicked");
              },
            },
          });
        }}
      >
        Show Toast
      </Button>

      <Toasts />
    </div>
  );
}

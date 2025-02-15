/* @jsxImportSource vue */
import "@atrium-ui/elements/portal";
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

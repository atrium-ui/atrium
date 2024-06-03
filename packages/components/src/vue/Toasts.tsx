/* @jsxImportSource vue */
import "@sv/elements/portal";
import { Button } from "@sv/components/src/vue/Button.jsx";
import { toast } from "@sv/elements/toast";
import { paragraph } from "txtgen";

export function ToastDemo() {
  return (
    <div>
      <Button
        onClick={() => {
          toast({
            message: paragraph(1),
            time: 3000,
          });
        }}
      >
        Show Toast
      </Button>

      <a-portal>
        <a-toast-feed class="fixed right-12 bottom-12 text-base" />
      </a-portal>
    </div>
  );
}

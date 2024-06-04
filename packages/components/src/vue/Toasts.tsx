/* @jsxImportSource vue */
import "@sv/elements/portal";
import { Button } from "./Button";
import { toast } from "@sv/elements/toast";

export function ToastDemo() {
  return (
    <div>
      <Button
        onClick={() => {
          toast({
            message: "Lorem ipsum is simply dummy text",
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

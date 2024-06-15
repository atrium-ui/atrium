/* @jsxImportSource vue */
import { Button } from "@components/src/vue/Button";
import { Sheet } from "@sv/components/src/vue/Sheet";

export default function () {
  return (
    <div>
      <Sheet>
        <div onclick="document.querySelector('a-blur').enabled = false">
          <Button>Close</Button>
        </div>
      </Sheet>

      <div onclick="document.querySelector('a-blur').enabled = true">
        <Button>Open</Button>
      </div>
    </div>
  );
}

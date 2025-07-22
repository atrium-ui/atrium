/* @jsxImportSource vue */
import { Button } from "@components/src/vue/Button";
import { Sheet } from "@components/src/vue/Sheet";

export default function () {
  return (
    <div>
      <Sheet>
        <div onclick="document.querySelector('#sheet').enabled = false">
          <Button>Close</Button>
        </div>
      </Sheet>

      <div onclick="document.querySelector('#sheet').enabled = true">
        <Button>Open</Button>
      </div>
    </div>
  );
}

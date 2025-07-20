/* @jsxImportSource vue */
import { Button } from "@components/src/vue/Button";
import { Popover } from "@components/src/vue/Popover";

export default function () {
  return (
    <div class="flex min-h-[200px] max-w-full items-center justify-center">
      <Popover label="Click">
        <div class="p-3">
          <p>Some Content</p>
          <Button>Button</Button>
        </div>
      </Popover>
    </div>
  );
}

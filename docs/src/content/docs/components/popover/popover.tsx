/* @jsxImportSource vue */
import { Button } from "@components/src/vue/Button";
import { Popover } from "@components/src/vue/Popover";

export default function () {
  return (
    <div class="max-w-[300px]">
      <Popover label="Click">
        <div class="p-3">
          <p>Some Content</p>
          <Button>Button</Button>
        </div>
      </Popover>
    </div>
  );
}

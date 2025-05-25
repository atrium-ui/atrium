/* @jsxImportSource vue */
import { Icon } from "@components/src/vue/Icon";
import { Button } from "@components/src/vue/Button";

export default function () {
  return (
    <div class="flex gap-10">
      <Button variant="ghost">Button</Button>
      <Button variant="ghost" disabled>
        Disabled
      </Button>
      <Button variant="ghost">
        <span>with icon</span>
        <Icon name="check" />
      </Button>
    </div>
  );
}

/* @jsxImportSource vue */
import { Icon } from "@components/src/vue/Icon";
import { Button } from "@components/src/vue/Button";

export default function () {
  return (
    <div class="flex gap-10">
      <Button variant="outline">Button</Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
      <Button variant="outline">
        <span>with icon</span>
        <Icon name="check" />
      </Button>
    </div>
  );
}

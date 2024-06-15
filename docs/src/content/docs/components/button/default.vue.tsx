/* @jsxImportSource vue */
import { Icon } from "@components/src/vue/Icon";
import { Button } from "@components/src/vue/Button";

export default function () {
  return (
    <div class="flex gap-10">
      <Button>Button</Button>
      <Button disabled>Disabled</Button>
      <Button>
        <span>with icon</span>
        <Icon name="check" />
      </Button>
    </div>
  );
}

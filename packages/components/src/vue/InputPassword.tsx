/* @jsxImportSource vue */
import { defineComponent } from "vue";
import { Input } from "./Input";

export const InputPassword = defineComponent(
  (props: { class?: string | string[]; value?: string }) => {
    return () => (
      <Input
        class={props.class}
        type="password"
        autocomplete="password"
        value={props.value}
      />
    );
  },
  {
    props: ["class", "value"],
  },
);

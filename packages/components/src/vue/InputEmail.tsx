/* @jsxImportSource vue */
import { defineComponent } from "vue";
import { Input } from "./Input";

export const InputEmail = defineComponent(
  (props: {
    class?: string | string[];
    value?: string;
  }) => {
    return () => (
      <Input class={props.class} type="email" autocomplete="email" value={props.value} />
    );
  },
  {
    props: ["class", "value"],
  },
);

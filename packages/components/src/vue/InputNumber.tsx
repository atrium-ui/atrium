/* @jsxImportSource vue */
import { defineComponent } from "vue";
import { Input } from "./Input";

export const InputNumber = defineComponent(
  (props: {
    class?: string | string[];
    value?: string;
  }) => {
    return () => <Input class={props.class} type="number" value={props.value} />;
  },
  {
    props: ["class", "value"],
  },
);

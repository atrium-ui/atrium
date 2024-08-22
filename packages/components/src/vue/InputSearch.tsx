/* @jsxImportSource vue */
import { defineComponent } from "vue";
import { Input } from "./Input";

export const InputSearch = defineComponent(
  (props: {
    class?: string | string[];
    value?: string;
  }) => {
    return () => (
      <Input
        class={props.class}
        type="search"
        autocomplete="search"
        value={props.value}
      />
    );
  },
  {
    props: ["class", "value"],
  },
);

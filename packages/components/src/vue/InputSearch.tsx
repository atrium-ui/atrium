/* @jsxImportSource vue */
import { defineComponent } from "vue";
import { Input } from "./Input";

export const InputSearch = defineComponent(
  (
    props: {
      class?: string | string[];
      value?: string;
      placeholder?: string;
      onKeydown?: (e: KeyboardEvent) => void;
      onInput?: (e: Event) => void;
    },
    context,
  ) => {
    return () => (
      <Input
        placeholder={props.placeholder}
        class={props.class}
        type="search"
        autocomplete="search"
        onKeydown={props.onKeydown}
        onInput={props.onInput}
        value={props.value}
      >
        {context.slots}
      </Input>
    );
  },
  {
    props: ["class", "value", "onKeydown", "onInput", "placeholder"],
  },
);

/* @jsxImportSource vue */
import { twMerge } from "tailwind-merge";

const inputVariants = {
  default: [
    "group w-full resize-y rounded-md border border-zinc-700 bg-transparent leading-normal px-3 py-1 hover:border-zinc-600 focus:border-zinc-500",
    "outline-none focus-visible:ring focus-visible:ring-zinc-500",
  ],
  error: ["border-red-600"],
};

import { defineComponent, ref } from "vue";

export const Input = defineComponent(
  (
    props: {
      slot?: string;
      class?: string;
      autofocus?: boolean;
      placeholder?: string;
      label?: string;
      name?: string;
      id?: string;
      value?: string;
      error?: string;
      required?: boolean;
      readonly?: boolean;
      type?: "password" | "text" | "email";
      multiline?: boolean;
      onInvalid?: (e: Event) => undefined | string | Error;
      onInput?: (e: Event) => void;
      onChange?: (e: Event) => void;
      onKeydown?: (e: KeyboardEvent) => void;
    },
    { slots },
  ) => {
    return () => (
      <div slot={props.slot} class={props.class}>
        <div class="text-sm">
          <label>{props.label}</label>
        </div>

        {props.multiline ? (
          <textarea
            autofocus={props.autofocus}
            id={props.id}
            name={props.name}
            readonly={props.readonly}
            required={props.required || undefined}
            placeholder={props.placeholder}
            value={props.value}
            class={twMerge(inputVariants.default, props.error && inputVariants.error)}
            onChange={props.onChange}
            onInput={props.onInput}
            onInvalid={(e) => {
              const err = props.onInvalid?.(e);
              e.preventDefault();
            }}
          />
        ) : (
          <input
            autofocus={props.autofocus}
            type={props.type}
            id={props.id}
            name={props.name}
            readonly={props.readonly}
            required={props.required || undefined}
            placeholder={props.placeholder}
            value={props.value}
            class={twMerge(inputVariants.default, props.error && inputVariants.error)}
            onChange={props.onChange}
            onKeydown={props.onKeydown}
            onInput={props.onInput}
            onInvalid={(e) => {
              const err = props.onInvalid?.(e);
              e.preventDefault();
            }}
          />
        )}

        {props.error ? (
          <div class="mt-1 text-red-600 text-sm">
            <label>{props.error}</label>
          </div>
        ) : null}
      </div>
    );
  },
  {
    props: [
      "slot",
      "class",
      "autofocus",
      "placeholder",
      "label",
      "name",
      "id",
      "value",
      "error",
      "required",
      "readonly",
      "type",
      "multiline",
      "onInvalid",
      "onInput",
      "onChange",
      "onKeydown",
    ],
  },
);

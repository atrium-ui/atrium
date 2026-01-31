/* @jsxImportSource solid-js */
import { twMerge } from "tailwind-merge";

const inputVariants = {
  default: [
    "group w-full resize-y rounded-md border border-zinc-200 bg-transparent leading-normal px-3 py-1 hover:border-zinc-400",
    "outline-none focus:ring-2 focus:ring-[currentColor]",
  ],
  error: ["border-red-600"],
};

export function Input(props: {
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
  password?: boolean;
  multiline?: boolean;
  onInvalid?: (e: Event) => undefined | string | Error;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
  onKeydown?: (e: KeyboardEvent) => void;
}) {
  return (
    <div class={props.class}>
      <div class="text-sm">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
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
          type={props.password ? "password" : "text"}
          id={props.id}
          name={props.name}
          readonly={props.readonly}
          required={props.required || undefined}
          placeholder={props.placeholder}
          value={props.value}
          class={twMerge(inputVariants.default, props.error && inputVariants.error)}
          onChange={props.onChange}
          onKeyDown={props.onKeydown}
          onInput={props.onInput}
          onInvalid={(e) => {
            const err = props.onInvalid?.(e);
            e.preventDefault();
          }}
        />
      )}

      {props.error ? (
        <div class="mt-1 text-red-600 text-sm">
          {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label>{props.error}</label>
        </div>
      ) : null}
    </div>
  );
}

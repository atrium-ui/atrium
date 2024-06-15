/* @jsxImportSource vue */
import { twMerge } from "tailwind-merge";

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
        <label>{props.label}</label>
      </div>

      {props.multiline ? (
        <textarea
          id={props.id}
          name={props.name}
          autofocus={props.autofocus}
          readonly={props.readonly}
          required={props.required || undefined}
          placeholder={props.placeholder}
          value={props.value}
          class={twMerge(
            "w-full resize-y rounded-md border border-zinc-700 bg-transparent px-3 py-1 outline-none focus:border-zinc-500 hover:border-zinc-600",
            props.error ? "border-red-600" : "border-zinc-700",
          )}
          onChange={props.onChange}
          onInput={props.onInput}
          onInvalid={(e) => {
            const err = props.onInvalid?.(e);
            e.preventDefault();
          }}
        />
      ) : (
        <input
          type={props.password ? "password" : "text"}
          id={props.id}
          name={props.name}
          autofocus={props.autofocus}
          readonly={props.readonly}
          required={props.required || undefined}
          placeholder={props.placeholder}
          value={props.value}
          class={twMerge(
            "w-full min-w-0 rounded-md border border-zinc-700 bg-transparent px-3 py-1 leading-normal outline-none focus:border-zinc-500 hover:border-zinc-600",
            props.error ? "border-red-600" : "border-zinc-700",
          )}
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
}

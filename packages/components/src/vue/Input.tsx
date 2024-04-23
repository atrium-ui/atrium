/* @jsxImportSource vue */

interface Props {
  class?: string;
  placeholder?: string;
  label?: string;
  name?: string;
  id?: string;
  value?: string;
  error?: string;
  required?: boolean;
  readonly?: boolean;
  multiline?: boolean;
  onInvalid?: (e: Event) => void;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
}

export function Input(props: Props) {
  return (
    <div class={props.class}>
      <div class="text-sm">
        <label>{props.label}</label>
      </div>

      {props.multiline ? (
        <textarea
          id={props.id}
          name={props.name}
          readonly={props.readonly}
          required={props.required || undefined}
          placeholder={props.placeholder}
          value={props.value}
          class={[
            "group w-full resize-y rounded-md border bg-transparent px-3 py-1 outline-none focus:border-zinc-500 hover:border-zinc-600",
            props.error ? "border-red-600" : "border-zinc-700",
          ].join("")}
          onChange={(e) => {
            props.onChange?.(e);
          }}
          onInput={(e) => {
            props.onInput?.(e);
          }}
          onInvalid={(e) => {
            const err = props.onInvalid?.(e);
            e.preventDefault();
          }}
        />
      ) : (
        <input
          type="text"
          id={props.id}
          name={props.name}
          readonly={props.readonly}
          required={props.required || undefined}
          placeholder={props.placeholder}
          value={props.value}
          class={[
            "group w-full min-w-0 rounded-md border bg-transparent px-3 py-1 leading-normal outline-none focus:border-zinc-500 hover:border-zinc-600",
            props.error ? "border-red-600" : "border-zinc-700",
          ].join("")}
          onChange={(e) => {
            props.onChange?.(e);
          }}
          onInput={(e) => {
            props.onInput?.(e);
          }}
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

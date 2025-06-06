/* @jsxImportSource vue */
import { defineComponent, type VNode } from "vue";
import { twMerge } from "tailwind-merge";

const variants = {
  default: [
    "group w-full resize-y rounded-md border border-zinc-700 bg-transparent leading-normal px-3 py-1 hover:border-zinc-400",
    "outline-hidden focus-within:ring-2 focus-within:ring-[currentColor]",
  ],
  error: ["border-red-600"],
};

export type InputProps = {
  class?: string | string[];
  autofocus?: boolean;
  placeholder?: string;
  prefix?: VNode | string;
  suffix?: VNode | string;
  name?: string;
  id?: string;
  value?: string;
  type?: string;
  error?: string;
  required?: boolean;
  autocomplete?: string;
  minlength?: number;
  readonly?: boolean;
  multiline?: boolean;
  onInvalid?: (e: Event) => undefined | string | Error;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onKeyup?: (e: KeyboardEvent) => void;
};

export const Input = defineComponent(
  (props: InputProps, context) => {
    return () => (
      <div>
        <div
          class={twMerge(
            "flex",
            variants.default,
            props.error && variants.error,
            props.multiline && "mt-4 min-h-10 px-5 lg:px-2",
            props.class,
          )}
        >
          {context.slots.default?.()}

          {props.prefix}

          {props.multiline ? (
            <textarea
              rows={6}
              id={props.id}
              name={props.name}
              autofocus={props.autofocus}
              readonly={props.readonly}
              required={props.required || undefined}
              placeholder={props.placeholder}
              class="m-0 flex-1 border-none bg-transparent p-0 outline-hidden"
              onChange={props.onChange}
              onInput={props.onInput}
              onInvalid={(e) => {
                const err = props.onInvalid?.(e);
                // e.preventDefault();
              }}
              {...(props.value ? { value: props.value } : {})}
            />
          ) : (
            <input
              type={props.type}
              id={props.id}
              name={props.name}
              autocomplete={props.autocomplete}
              autofocus={props.autofocus}
              readonly={props.readonly}
              required={props.required || undefined}
              placeholder={props.placeholder}
              class="m-0 flex-1 border-none bg-transparent p-0 outline-hidden"
              onChange={props.onChange}
              onKeydown={props.onKeydown}
              onKeyup={props.onKeyup}
              onInput={props.onInput}
              minlength={props.minlength}
              onInvalid={(e) => {
                const err = props.onInvalid?.(e);
                // e.preventDefault();
              }}
              {...(props.value ? { value: props.value } : {})}
            />
          )}

          {props.suffix}
        </div>

        {props.error ? (
          <div class="pt-2 text-md text-yellow">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label>{props.error}</label>
          </div>
        ) : null}
      </div>
    );
  },
  {
    props: [
      "class",
      "autofocus",
      "placeholder",
      "name",
      "id",
      "value",
      "type",
      "error",
      "required",
      "autocomplete",
      "readonly",
      "multiline",
      "onInvalid",
      "onInput",
      "onChange",
      "onKeydown",
      "onKeyup",
      "prefix",
      "suffix",
      "minlength",
    ],
  },
);

/* @jsxImportSource vue */
import { defineComponent, type VNode } from "vue";
import { twMerge } from "tailwind-merge";

const variants = {
  default: [
    "group w-full resize-y rounded-md border border-zinc-700 bg-transparent leading-normal px-3 py-1 hover:border-zinc-600 focus:border-zinc-500",
    "outline-none focus-visible:ring focus-visible:ring-zinc-500",
  ],
  error: ["border-red-600"],
};

export type InputProps = {
  class?: string | string[];
  autofocus?: boolean;
  placeholder?: string;
  label?: string;
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
        <div class="text-sm">
          <label
            class={[
              "pb-5 font-bold text-green-200 text-xs uppercase",
              props.multiline ? "mx-5 lg:mx-0" : "",
            ]}
            for={props.id}
          >
            <span>{props.label}</span>
            {props.required && <span> *</span>}
          </label>
        </div>

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
              class="m-0 flex-1 border-none bg-transparent p-0 outline-none"
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
              class="m-0 flex-1 border-none bg-transparent p-0 outline-none"
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
      "label",
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

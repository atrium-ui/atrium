/* @jsxImportSource vue */
import { ref, defineComponent } from "vue";
import { Input } from "./Input.jsx";
import { Button } from "@sv/components/src/vue/Button.jsx";
import "@sv/elements/adaptive";
import "@sv/elements/form";

export const Form = defineComponent(
  (
    props: {
      onSubmit: (data: FormData) => Promise<string> | string;
    },
    { slots },
  ) => {
    const error = ref<string>();
    const success = ref<string>();
    const loading = ref(false);

    const submit = async (e: Event) => {
      const form = e.currentTarget as HTMLFormElement;

      e.preventDefault();
      e.stopPropagation();

      loading.value = true;

      try {
        const data = new FormData(form);
        const res = await props.onSubmit?.(data);
        success.value = res;
      } catch (err: any) {
        error.value = err;
        console.error(error.value);

        // backpropagate errors to inputs
        // for (const error of errors) {
        //   for (const key in error) {
        //     const e = new CustomEvent('error', { bubbles: true, detail: { name: key, message: error[key] } })
        //     form.dispatchEvent(e)
        //   }
        // }
      } finally {
        loading.value = false;
      }
    };

    return () => (
      <div>
        {success.value ? (
          <div>
            <h2>Success</h2>
            <p>{success.value}</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div class="flex flex-col gap-8">{slots.default?.()}</div>

            <Button type="submit" class="mt-4 overflow-hidden">
              <a-adaptive>
                <div class="flex items-center gap-2">
                  <span>Submit</span>
                  {loading.value && <span class="loading-indicator flex-none" />}
                </div>
              </a-adaptive>
            </Button>
          </form>
        )}

        {error.value && (
          <div class="text-red-600">
            <p>{error.value}</p>
          </div>
        )}
      </div>
    );
  },
  {
    props: ["onSubmit"],
  },
);

export const FormField = defineComponent(
  (props: {
    field: {
      type: "text" | "name" | "email" | "textarea" | "checkbox" | "date";
      description?: string;
      label: string;
      error?: string;
      placeholder: string;
      name: string;
      required?: boolean;
      value: string | boolean;
    };
  }) => {
    const InputField = (props) => {
      switch (props.type) {
        case "text":
        case "name":
          return <Input {...props} />;
        case "email":
          return <Input type="email" {...props} />;
        case "textarea":
          return <Input multiline {...props} />;
        case "checkbox":
          return <Input type="checkbox" {...props} />;
        case "date":
          return <Input type="date" {...props} />;
        default:
          return <Input {...props} />;
      }
    };

    return () => (
      <a-form-field>
        <div class={`form-field-${props.field.type}`}>
          <InputField
            {...props.field}
            label={
              !props.field.description
                ? `${props.field.label} ${props.field.required ? "" : "(optional)"}`
                : null
            }
            id={props.field.name}
            class={`form-field-input-${props.field.type}`}
          />

          {props.field.description ? (
            <div class="form-field-description">
              <label for={props.field.name}>{props.field.description}</label>
            </div>
          ) : null}
        </div>

        <div class="text-red-400 text-xs">
          <a-form-field-error />
        </div>
      </a-form-field>
    );
  },
  {
    props: ["field"],
  },
);

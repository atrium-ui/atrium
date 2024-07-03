/* @jsxImportSource vue */
import { ref, defineComponent } from "vue";
import "@sv/elements/transition";
import "@sv/elements/form";
import { Button } from "./Button.jsx";

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
        error.value = undefined;
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
            <div class="flex flex-col gap-4">{slots.default?.()}</div>

            <Button type="submit" class="mt-8 overflow-hidden">
              <a-transition>
                <div class="flex items-center gap-2">
                  <span>Submit</span>
                  {loading.value && <span class="loading-indicator flex-none" />}
                </div>
              </a-transition>
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
  (
    props: {
      field: {
        name: string;
        label?: string;
        description?: string;
        error?: string;
      };
    },
    { slots },
  ) => {
    return () => (
      <a-form-field>
        <div>
          {props.field.label && (
            <div class="text-sm">
              <label>{!props.field.description ? `${props.field.label}` : null}</label>
            </div>
          )}

          {slots.default?.()}

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

import { Button } from "@sv/components/templates/button.jsx";
import { FormField, FormRenderer } from "@sv/components/templates/form.jsx";
import { createSignal } from "solid-js";
import "@sv/elements/adaptive";

const formSpec = {
  pages: [],
  rows: [
    {
      rowFields: [
        {
          defaultValue: "",
          displayName: "Name",
          name: "Name",
          errorMessage: "",
          handle: "name",
          instructions: "",
          placeholder: "",
          required: true,
          typeName: "Field_SingleLineText",
        },
        {
          defaultValue: "",
          displayName: "Name 2",
          name: "Name 2",
          errorMessage: "",
          handle: "name2",
          instructions: "",
          placeholder: "",
          required: true,
          typeName: "Field_SingleLineText",
        },
      ],
    },
    {
      rowFields: [
        {
          defaultValue: "",
          displayName: "Text",
          name: "Text",
          errorMessage: "",
          handle: "text",
          instructions: "",
          placeholder: "",
          typeName: "Field_MultiLineText",
        },
      ],
    },
  ],
};

export function SomeForm() {
  const [error, setError] = createSignal<string>();
  const [success, setSuccess] = createSignal<string>();
  const [loading, setLoading] = createSignal(false);

  const renderer = new FormRenderer();

  return (
    <div>
      {success() ? (
        <div>
          <h2>Geschafft</h2>
          <p>{success()}</p>
        </div>
      ) : (
        <form
          class="flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault();

            const [fields, variables] = renderer.variables(
              formSpec,
              new FormData(e.currentTarget),
            );

            console.info("FORM -> SUBMIT", fields, variables);

            setLoading(true);

            setTimeout(() => {
              setError("Failed");
              setLoading(false);
            }, 2000);
          }}
        >
          {renderer.renderRows(formSpec.rows).map((row, rowIndex) => {
            return (
              <div key={`form_row_${rowIndex}`} class="flex gap-8">
                {row.map((field, fieldIndex) => {
                  if (field)
                    return (
                      <div
                        key={`form_row_${rowIndex}_field_${fieldIndex}`}
                        class="flex-1"
                      >
                        {field.type === "heading" ? (
                          <div>
                            <h2>{field.label}</h2>
                          </div>
                        ) : (
                          <FormField field={field} />
                        )}
                      </div>
                    );
                })}
              </div>
            );
          })}

          <div>
            <Button type="submit" disabled={!!loading()} class="overflow-hidden">
              <a-adaptive>
                <div class="flex gap-2 items-center">
                  <span>{"Submit"}</span>
                  {loading() ? <span class="loading-indicator flex-none" /> : ""}
                </div>
              </a-adaptive>
            </Button>
          </div>
        </form>
      )}

      {error() ? (
        <div>
          <p>{error()}</p>
        </div>
      ) : null}
    </div>
  );
}

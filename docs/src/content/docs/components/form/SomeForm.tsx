/* @jsxImportSource vue */
import { Form, FormField } from "@sv/components/src/vue/Form.jsx";

export function SomeForm() {
  return (
    <Form
      onSubmit={(data) => {
        console.info("Submit:", [...data]);

        return new Promise((ok, err) => {
          setTimeout(() => {
            if (Math.random() > 0.5) err("Error submitting the form");
            else ok("Success submitting the form!");
          }, 1000);
        });
      }}
    >
      <div class="grid grid-cols-2 gap-4">
        <FormField
          field={{
            required: true,
            type: "name",
            label: "Name",
            name: "name",
            placeholder: "Name",
            value: "",
          }}
        />
        <FormField
          field={{
            required: true,
            type: "email",
            label: "Email",
            name: "email",
            placeholder: "Email",
            value: "",
          }}
        />
      </div>

      <FormField
        field={{
          type: "textarea",
          label: "Message",
          name: "message",
          placeholder: "Message",
          value: "",
        }}
      />
    </Form>
  );
}

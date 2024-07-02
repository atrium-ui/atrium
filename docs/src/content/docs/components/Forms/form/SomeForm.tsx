/* @jsxImportSource vue */
import { Form, FormField } from "@components/src/vue/Form";
import { Input } from "@components/src/vue/Input";
import { Select, SelectItem } from "@components/src/vue/Select";
import { Checkbox } from "@components/src/vue/Checkbox";

export function SomeForm() {
  return (
    <Form
      class="w-[35rem] text-base"
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
            label: "Name",
            name: "name",
          }}
        >
          <Input
            {...{
              required: true,
              name: "name",
              placeholder: "Albert",
            }}
          />
        </FormField>
        <FormField
          field={{
            label: "Email",
            name: "email",
          }}
        >
          <Input
            {...{
              required: true,
              type: "email",
              name: "email",
              placeholder: "mail@example.com",
            }}
          />
        </FormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormField
          field={{
            label: "Name",
            name: "name",
          }}
        >
          <Select
            {...{
              required: true,
              name: "name",
              placeholder: "Select",
            }}
          >
            <SelectItem class="opacity-50" value="">
              Select
            </SelectItem>
            <SelectItem value="Option 1" />
            <SelectItem value="Option 2" />
            <SelectItem value="Option 3" />
          </Select>
        </FormField>

        <FormField
          field={{
            label: "Name",
            name: "name",
          }}
        >
          <Select
            {...{
              class: "w-full",
              required: true,
              name: "name",
              placeholder: "Select",
            }}
          >
            <SelectItem class="opacity-50" value="">
              Select
            </SelectItem>
            <SelectItem value="Option 1" />
            <SelectItem value="Option 2" />
            <SelectItem value="Option 3" />
          </Select>
        </FormField>
      </div>

      <FormField
        field={{
          label: "Message (optional)",
          name: "message",
        }}
      >
        <Input
          {...{
            multiline: true,
            name: "message",
            placeholder: "Something...",
          }}
        />
      </FormField>

      <FormField
        field={{
          name: "message",
        }}
      >
        <Checkbox required name="checkbox1">
          <span>I agree to use this checkbox</span>
        </Checkbox>
      </FormField>
    </Form>
  );
}

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
            name: "name",
          }}
        >
          <Input
            {...{
              required: true,
              name: "name",
              placeholder: "Albert",
              label: "Name",
            }}
          />
        </FormField>
        <FormField
          field={{
            name: "email",
          }}
        >
          <Input
            {...{
              required: true,
              type: "email",
              name: "email",
              placeholder: "mail@example.com",
              label: "Email",
            }}
          />
        </FormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormField
          field={{
            name: "name",
          }}
        >
          <Select
            {...{
              required: true,
              name: "name",
              placeholder: "Select",
              label: "Name",
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
            name: "name",
          }}
        >
          <Select
            {...{
              class: "w-full",
              name: "name",
              placeholder: "Select",
              value: "Option 2",
              label: "Name",
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
          name: "message",
        }}
      >
        <Input
          {...{
            multiline: true,
            name: "message",
            placeholder: "Something...",
            label: "Message (optional)",
          }}
        />
      </FormField>

      <FormField
        field={{
          name: "message",
        }}
      >
        <Checkbox required name="checkbox1" label="I agree to use this checkbox">
          <span>I agree to use this checkbox</span>
        </Checkbox>
      </FormField>
    </Form>
  );
}

/* @jsxImportSource vue */
import { Form, FormField } from "@components/src/vue";
import { Input } from "@components/src/vue";
import { Select, SelectItem } from "@components/src/vue";
import { Checkbox } from "@components/src/vue";

export function SomeForm() {
  return (
    <Form
      class="mx-auto my-8 w-full max-w-[38rem] rounded-2xl border border-zinc-200 bg-white p-5 text-base sm:my-10 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950"
      submitLabel="Send project inquiry"
      submitClass="w-full justify-center bg-zinc-900 py-3 font-medium hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
      onSubmit={(data) => {
        console.info("Submit:", [...data]);
      }}
    >
      <header class="pb-2">
        <span class="inline-flex rounded-full bg-zinc-100 px-3 py-1 font-semibold text-xs text-zinc-600 uppercase tracking-wide dark:bg-zinc-800 dark:text-zinc-300">
          Project inquiry
        </span>
        <h3 class="mt-4 font-semibold text-2xl text-zinc-950 tracking-tight dark:text-white">
          Tell us what you're building
        </h3>
        <p class="mt-2 max-w-lg text-sm text-zinc-600 leading-6 dark:text-zinc-400">
          Share a few details about your project. We’ll use them to bring the right people
          into the first conversation.
        </p>
      </header>

      <div aria-hidden="true" class="h-px bg-zinc-200 dark:bg-zinc-800" />

      <div class="pt-2">
        <p class="mb-3 font-semibold text-xs text-zinc-500 uppercase tracking-wide">
          Contact details
        </p>

        <div class="grid gap-4 sm:grid-cols-2">
          <FormField
            field={{
              name: "first-name",
              label: "First name (required)",
            }}
          >
            <Input
              {...{
                id: "first-name",
                required: true,
                name: "first-name",
                placeholder: "Albert",
                autocomplete: "given-name",
              }}
            />
          </FormField>
          <FormField
            field={{
              name: "email",
              label: "Email address (required)",
            }}
          >
            <Input
              {...{
                id: "email",
                required: true,
                type: "email",
                name: "email",
                placeholder: "mail@example.com",
                autocomplete: "email",
              }}
            />
          </FormField>
        </div>
      </div>

      <div class="pt-2">
        <p class="mb-3 font-semibold text-xs text-zinc-500 uppercase tracking-wide">
          Project details
        </p>

        <div class="grid gap-4 sm:grid-cols-2">
          <FormField
            field={{
              name: "role",
              label: "Your role (required)",
            }}
          >
            <Select
              {...{
                required: true,
                name: "role",
                placeholder: "Choose a role",
              }}
            >
              <SelectItem class="opacity-50" value="">
                Choose a role
              </SelectItem>
              <SelectItem value="Designer" />
              <SelectItem value="Developer" />
              <SelectItem value="Product manager" />
            </Select>
          </FormField>

          <FormField
            field={{
              name: "country",
              label: "Country (required)",
            }}
          >
            <div class="relative">
              <select
                id="country"
                name="country"
                required
                class="w-full cursor-pointer appearance-none rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 pr-10 outline-hidden transition-colors hover:border-zinc-400 hover:bg-zinc-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-400 dark:hover:border-zinc-500 dark:hover:bg-zinc-700"
              >
                <option value="">Select a country</option>
                <option value="de">Germany</option>
                <option value="gb">United Kingdom</option>
                <option value="us">United States</option>
              </select>

              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                class="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 size-4 text-zinc-500"
              >
                <path
                  d="m5 7.5 5 5 5-5"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </FormField>
        </div>

        <FormField
          field={{
            name: "message",
            label: "What can we help with? (optional)",
          }}
        >
          <Input
            {...{
              id: "message",
              multiline: true,
              name: "message",
              placeholder:
                "Share your goals, timeline, or anything else that would be useful...",
            }}
          />
        </FormField>
      </div>

      <FormField
        field={{
          name: "terms",
        }}
      >
        <Checkbox
          required
          name="terms"
          label="I agree to be contacted about this request (required)"
        >
          <span class="text-sm leading-5">
            I agree to be contacted about this request (required)
          </span>
        </Checkbox>
      </FormField>

      <div class="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2.5 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        <span aria-hidden="true" class="size-2 flex-none rounded-full bg-emerald-500" />
        We usually reply within two business days.
      </div>
    </Form>
  );
}

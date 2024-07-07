/* @jsxImportSource vue */

import { Card } from "../Card";
import { Input } from "@components/src/vue/Input";
import { Form, FormField } from "@components/src/vue/Form";

export function LoginCard() {
  return (
    <Card>
      <div class="flex flex-col space-y-1">
        <h3 class="whitespace-nowrap font-bold text-2xl tracking-tight">Login</h3>
        <p class="text-muted-foreground text-sm">
          Enter your username and password to access your account.
        </p>
      </div>

      <div class="pt-8">
        <Form
          class="space-y-4"
          submitClass="w-full justify-center"
          submitLabel="Login"
          onSubmit={(e) => e.preventDefault()}
        >
          <FormField
            field={{
              name: "username",
            }}
            class="space-y-2"
          >
            <label
              class="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="username"
            >
              Username
            </label>
            <Input required name="username" placeholder="Enter your username" />
          </FormField>
          <FormField
            field={{
              name: "password",
            }}
            class="space-y-2"
          >
            <label
              class="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="password"
            >
              Password
            </label>

            <Input required name="password" placeholder="Password" />
          </FormField>
        </Form>
      </div>
    </Card>
  );
}

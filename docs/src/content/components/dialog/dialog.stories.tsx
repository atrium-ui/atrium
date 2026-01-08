/* @jsxImportSource vue */

import { Button } from "@components/src/vue/Button.jsx";
import type { Story } from "../../../components/stories/stories.js";
import { Dialog } from "@components/src/vue/Dialog";

export default {
  tags: ["public"],
  args: {},
  argTypes: {},
} satisfies Story;

export const Default = {
  render: () => (
    <div class="flex min-h-[300px] max-w-full items-center justify-center">
      <Dialog label="Open Dialog">
        <h2 class="mb-2 text-2xl">Welcome</h2>
        <p>This is a simple dialog with basic content.</p>

        <div class="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={(ev) => {
              ev.target?.dispatchEvent(new CustomEvent("exit", { bubbles: true }));
            }}
          >
            Close
          </Button>
        </div>
      </Dialog>
    </div>
  ),
};

export const Confirmation = {
  render: () => (
    <div class="flex min-h-[300px] max-w-full items-center justify-center">
      <Dialog label="Delete Item">
        <h2 class="mb-2 text-2xl">Are you sure?</h2>
        <p>This action cannot be undone. Do you want to proceed?</p>

        <div class="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={(ev) => {
              ev.target?.dispatchEvent(new CustomEvent("exit", { bubbles: true }));
            }}
          >
            Cancel
          </Button>
          <Button class="ml-2 bg-red-600 text-white hover:bg-red-700">Delete</Button>
        </div>
      </Dialog>
    </div>
  ),
};

export const FormDialog = {
  render: () => (
    <div class="flex min-h-[300px] max-w-full items-center justify-center">
      <Dialog label="Sign Up">
        <h2 class="mb-2 text-2xl">Create Account</h2>
        <form
          class="space-y-4"
          onSubmit={(ev) => {
            ev.preventDefault();
          }}
        >
          <div>
            <label for="email" class="block font-medium text-sm">Email</label>
            <input
              id="email"
              type="email"
              required
              class="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label for="password" class="block font-medium text-sm">Password</label>
            <input
              id="password"
              type="password"
              required
              class="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            />
          </div>

          <div class="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={(ev) => {
                ev.target?.dispatchEvent(new CustomEvent("exit", { bubbles: true }));
              }}
            >
              Cancel
            </Button>
            <Button class="ml-2" type="submit">
              Submit
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  ),
};

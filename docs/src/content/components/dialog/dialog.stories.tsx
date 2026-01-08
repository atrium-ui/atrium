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
    <div class="flex max-w-full items-center justify-center min-h-[300px]">
      <Dialog label="Open Dialog">
        <h2 class="text-2xl mb-2">Welcome</h2>
        <p>This is a simple dialog with basic content.</p>

        <div class="mt-4 flex justify-end">
          <Button variant="outline" onClick={(ev) => { ev.target?.dispatchEvent(new CustomEvent('exit', { bubbles: true })); }}>
            Close
          </Button>
        </div>
      </Dialog>
    </div>
  ),
};

export const Confirmation = {
  render: () => (
    <div class="flex max-w-full items-center justify-center min-h-[300px]">
      <Dialog label="Delete Item">
        <h2 class="text-2xl mb-2">Are you sure?</h2>
        <p>This action cannot be undone. Do you want to proceed?</p>

        <div class="mt-4 flex justify-end">
          <Button variant="outline" onClick={(ev) => { ev.target?.dispatchEvent(new CustomEvent('exit', { bubbles: true })); }}>
            Cancel
          </Button>
          <Button class="ml-2 bg-red-600 text-white hover:bg-red-700">
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  ),
};

export const FormDialog = {
  render: () => (
    <div class="flex max-w-full items-center justify-center min-h-[300px]">
      <Dialog label="Sign Up">
        <h2 class="text-2xl mb-2">Create Account</h2>
        <form class="space-y-4" onSubmit={(ev) => { ev.preventDefault(); }}>
          <div>
            <label class="block text-sm font-medium">Email</label>
            <input type="email" required class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium">Password</label>
            <input type="password" required class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded" />
          </div>

          <div class="mt-4 flex justify-end">
            <Button variant="outline" onClick={(ev) => { ev.target?.dispatchEvent(new CustomEvent('exit', { bubbles: true })); }}>
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

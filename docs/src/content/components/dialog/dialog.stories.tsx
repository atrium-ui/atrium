/* @jsxImportSource vue */

import { Button, Dialog, Input } from "@components/src/vue";
import type { Story } from "../../../components/stories/stories.js";

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
            <label for="email" class="block font-medium text-sm">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              class="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label for="password" class="block font-medium text-sm">
              Password
            </label>
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

export const LandingPage = {
  render: () => (
    <div class="flex h-full items-start px-8 py-7">
      <div class="grid w-full content-start gap-6 bg-white">
        <div class="flex gap-6">
          <div class="w-[250px] rounded-md border border-zinc-200 bg-white p-3">
            <a-calendar value="2026-03-18" />
          </div>
          <div class="grid flex-1 content-start gap-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm text-zinc-800">Invited people</div>
                <div class="text-xs text-zinc-500">Wednesday, March 18 at 2:00 PM</div>
              </div>
              <Dialog label="Invite team">
                <div class="w-[22rem]">
                  <h2 class="mb-2 font-medium text-lg text-zinc-900">Invite teammates</h2>
                  <p class="text-sm text-zinc-600">
                    Add people before the review starts.
                  </p>

                  <div class="mt-4 grid gap-3">
                    <div class="grid gap-1.5">
                      <label
                        for="invite-emails"
                        class="font-medium text-xs text-zinc-700"
                      >
                        Invite people
                      </label>
                      <Input
                        id="invite-emails"
                        value="maya@studio.co, alex@studio.co, priya@studio.co"
                        class="text-sm text-zinc-700"
                      />
                    </div>

                    <div class="grid gap-1.5">
                      <label for="invite-role" class="font-medium text-xs text-zinc-700">
                        Access
                      </label>
                      <a-popover-trigger class="relative z-10 w-full">
                        <button
                          id="invite-role"
                          slot="trigger"
                          type="button"
                          class="flex w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-1 text-left text-sm text-zinc-700 hover:border-zinc-400"
                        >
                          <span>Can edit</span>
                          <span aria-hidden="true" class="text-zinc-400">
                            v
                          </span>
                        </button>

                        <a-popover class="group block w-full" placements="bottom-center">
                          <div class="group z-50 mt-1 block w-[350px] rounded-md border border-zinc-200 bg-white opacity-0 shadow-lg transition-opacity duration-100 group-[&[enabled]]:opacity-100">
                            <a-list class="group -translate-y-1 max-h-[200px] overflow-auto rounded-md bg-white transition-all duration-150 group-[&[enabled]]:translate-y-0">
                              {["Can edit", "Can comment", "View only"].map(
                                (item, index) => (
                                  <a-list-item
                                    key={index}
                                    class="mb-1 last:mb-0 focus-within:bg-blue-100"
                                  >
                                    <button
                                      type="button"
                                      class="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                                    >
                                      {item}
                                    </button>
                                  </a-list-item>
                                ),
                              )}
                            </a-list>
                          </div>
                        </a-popover>
                      </a-popover-trigger>
                    </div>
                  </div>

                  <div class="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={(ev) => {
                        ev.target?.dispatchEvent(
                          new CustomEvent("exit", { bubbles: true }),
                        );
                      }}
                    >
                      Not now
                    </Button>
                    <Button class="bg-zinc-900 text-white hover:bg-zinc-900 active:bg-zinc-900">
                      Send invite
                    </Button>
                  </div>
                </div>
              </Dialog>
            </div>

            <div class="grid content-start gap-2">
              {[
                ["Maya Chen", "Design review owner", "Accepted", "text-emerald-700"],
                ["Alex Rivera", "Can edit launch deck", "Pending", "text-zinc-500"],
                ["Priya Patel", "Comment access for notes", "Queued", "text-zinc-500"],
              ].map(([name, role, status, color]) => (
                <div class="grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-zinc-200 bg-white px-3 py-2">
                  <div class="h-8 w-8 flex-none rounded-full bg-zinc-200" />
                  <div>
                    <div class="text-sm text-zinc-800">{name}</div>
                    <div class="text-xs text-zinc-500">{role}</div>
                  </div>
                  <div class={`text-[10px] uppercase tracking-[0.14em] ${color}`}>
                    {status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

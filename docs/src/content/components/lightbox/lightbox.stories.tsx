/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Lightbox } from "@components/src/vue";

export default {
  tags: ["public"],
  args: {},
} satisfies Story;

export const Default = {
  render: () => {
    return (
      <div class="flex min-h-[760px] w-full items-center px-12 py-10">
        <div class="mx-auto grid w-full max-w-6xl gap-8">
          <article class="overflow-hidden">
            <div class="border-stone-200 border-b px-6 py-5 sm:px-8">
              <div class="mb-4 flex items-center gap-3">
                <div class="h-11 w-11 rounded-full bg-stone-200" />
                <div class="flex-1">
                  <div class="h-4 w-32 rounded bg-stone-300" />
                  <div class="mt-2 h-3 w-24 rounded bg-stone-200" />
                </div>
              </div>

              <div class="h-8 w-3/4 rounded bg-stone-300 sm:w-2/3" />
              <div class="mt-3 h-4 w-full rounded bg-stone-200" />
              <div class="mt-2 h-4 w-5/6 rounded bg-stone-200" />
            </div>

            <div class="px-6 py-6 sm:px-8">
              <div class="mb-5 flex gap-3">
                <div class="h-7 w-20 rounded-full bg-emerald-100" />
                <div class="h-7 w-24 rounded-full bg-sky-100" />
              </div>

              <Lightbox>
                <img
                  src="https://picsum.photos/id/12/1280/720"
                  alt="Landscape photograph"
                  decoding="async"
                  class="block h-auto w-full rounded-2xl object-cover shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)]"
                />
              </Lightbox>

              <div class="mt-6 grid gap-3">
                <div class="h-4 w-full rounded bg-stone-200" />
                <div class="h-4 w-full rounded bg-stone-200" />
                <div class="h-4 w-11/12 rounded bg-stone-200" />
                <div class="h-4 w-4/5 rounded bg-stone-200" />
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  },
};

export const LandingPage = {
  render: () => (
    <div class="h-full p-4">
      <div class="grid h-full content-start gap-4">
        <div class="grid h-full content-start gap-2">
          {[
            [
              "Maya Chen",
              "This crop works. We should check the image at full size before approving the final placement.",
              "Now",
            ],
            [
              "Alex Rivera",
              "Open this attachment from the thread and compare the edges against the mobile breakpoints.",
              "2 min ago",
            ],
            [
              "Jordan Lee",
              "Looks great — let's finalize the crop and upload the optimized file.",
              "5 min ago",
            ],
          ].map(([name, body, time], index) => (
            <div key={`${name}-${time}-${index}`} class="flex gap-2 py-3">
              <div class="h-8 w-8 flex-none rounded-full bg-zinc-200" />
              <div>
                <div class="my-1.5 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <div class="text-sm text-zinc-800">{name}</div>
                  <div class="text-[10px] text-zinc-400 uppercase tracking-[0.14em]">
                    {time}
                  </div>
                </div>
                <p
                  class={
                    index === 1 ? "mb-3 text-sm text-zinc-600" : "text-sm text-zinc-600"
                  }
                >
                  {body}
                </p>
                {index === 1 && (
                  <Lightbox>
                    <img
                      src="https://picsum.photos/id/12/1280/720"
                      alt="Landscape photograph attached to a comment"
                      decoding="async"
                      class="block h-[220px] w-full rounded-md object-cover"
                    />
                  </Lightbox>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

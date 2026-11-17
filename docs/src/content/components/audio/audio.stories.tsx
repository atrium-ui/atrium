/* @jsxImportSource vue */
import type { Story } from "@atrium-ui/astro-stories";
import Audio from "@components/src/vue/Audio.vue";

const src =
  "https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/audio.m4a";

export default {
  tags: ["public"],
  args: {},
} satisfies Story;

export const Default = {
  render: () => (
    <div class="flex min-h-[240px] w-full items-center justify-center p-10">
      <Audio class="max-w-xl" src={src} label="Sample audio" />
    </div>
  ),
};

export const Podcast = {
  render: () => (
    <div class="flex min-h-[360px] w-full items-center justify-center p-10">
      <article class="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-5 font-sans shadow-lg">
        <div class="mb-5 flex items-center gap-4">
          <div class="grid h-20 w-20 flex-none place-items-center rounded-lg bg-linear-to-br from-zinc-800 to-zinc-950 text-2xl text-white">
            #12
          </div>
          <div class="min-w-0">
            <div class="text-xs text-zinc-500 uppercase tracking-[0.14em]">
              Atrium Podcast · Episode 12
            </div>
            <h3 class="mt-1 mb-1 truncate text-lg text-zinc-900">
              Building framework agnostic components
            </h3>
            <p class="text-sm text-zinc-600">Nov 17, 2026 · 9 min</p>
          </div>
        </div>
        <Audio
          class="border-0 bg-zinc-100"
          src={src}
          label="Episode 12: Building framework agnostic components"
        />
      </article>
    </div>
  ),
};

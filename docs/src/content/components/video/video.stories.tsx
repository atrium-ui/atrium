/* @jsxImportSource vue */
import type { Story } from "@atrium-ui/astro-stories";
import Video from "@components/src/vue/Video.vue";

const playbackId = "BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM";
const src = `https://stream.mux.com/${playbackId}/highest.mp4`;
const poster = `https://image.mux.com/${playbackId}/thumbnail.webp?time=8`;

export default {
  tags: ["public"],
  args: {},
} satisfies Story;

export const Default = {
  render: () => (
    <div class="flex min-h-[480px] w-full items-center justify-center p-10">
      <Video class="max-w-2xl" src={src} label="Sample video" />
    </div>
  ),
};

export const Poster = {
  render: () => (
    <div class="flex min-h-[480px] w-full items-center justify-center p-10">
      <Video class="max-w-2xl" src={src} poster={poster} label="Sample video" />
    </div>
  ),
};

export const Feature = {
  render: () => (
    <div class="flex min-h-[520px] w-full items-center justify-center p-10">
      <div class="grid w-full max-w-4xl items-center gap-8 md:grid-cols-[1fr_1.6fr]">
        <div class="font-sans">
          <div class="text-xs text-zinc-500 uppercase tracking-[0.14em]">Showreel</div>
          <h3 class="mt-2 mb-4 text-2xl text-zinc-900">Made with Atrium</h3>
          <p class="text-zinc-600 leading-relaxed">
            A short look at what we built this year. Press play, or focus the player and
            use the keyboard.
          </p>
        </div>
        <Video
          class="rounded-xl shadow-xl"
          src={src}
          poster={poster}
          label="Atrium showreel"
        />
      </div>
    </div>
  ),
};

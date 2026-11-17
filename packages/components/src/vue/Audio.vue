<script setup lang="ts">
import "@atrium-ui/elements/media";
import { twMerge } from "tailwind-merge";
import Icon from "./Icon.vue";

const props = defineProps<{
  src: string;
  label: string;
  class?: string;
}>();
</script>

<template>
  <a-media
    role="group"
    :aria-label="label"
    :class="
      twMerge(
        'flex w-full items-center gap-1 rounded-lg border border-zinc-200 bg-white p-2 font-sans text-lg text-zinc-900',
        props.class,
      )
    "
  >
    <audio :src="src" preload="metadata">
      <slot />
    </audio>

    <a-media-play class="grid h-10 w-10 flex-none place-items-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2 active:bg-zinc-600 active:transition-none [&>span]:flex">
      <span slot="play"><Icon name="play" /><span class="sr-only">Play</span></span>
      <span slot="pause"><Icon name="pause" /><span class="sr-only">Pause</span></span>
    </a-media-play>

    <a-media-skip :seconds="-15" class="hidden h-9 w-9 flex-none place-items-center rounded-md transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:-outline-offset-2 active:bg-zinc-200 active:transition-none sm:grid [&>span]:flex">
      <span><Icon name="reload" class="-scale-x-100" /><span class="sr-only">Back 15 seconds</span></span>
    </a-media-skip>

    <a-media-skip :seconds="30" class="hidden h-9 w-9 flex-none place-items-center rounded-md transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:-outline-offset-2 active:bg-zinc-200 active:transition-none sm:grid [&>span]:flex">
      <span><Icon name="reload" /><span class="sr-only">Forward 30 seconds</span></span>
    </a-media-skip>

    <a-media-time type="current" class="mx-2 flex-none text-sm text-zinc-600" />

    <a-media-seek
      label="Seek"
      class="block min-w-0 flex-1 [--range-handle-background:var(--color-zinc-900)] [--range-handle-size:0.75rem] [--range-outline-color:var(--color-zinc-900)] [--range-progress-background:var(--color-zinc-900)] [--range-track-background:var(--color-zinc-300)] [--range-track-padding:0.5rem_0] [--range-track-height:0.25rem]"
    />

    <a-media-time type="remaining" class="mx-2 flex-none text-sm text-zinc-600" />

    <a-media-rate class="h-9 min-w-12 flex-none rounded-md px-1 text-sm transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:-outline-offset-2 active:bg-zinc-200 active:transition-none [font-variant-numeric:tabular-nums]">
      <span class="sr-only">Playback speed</span>
    </a-media-rate>

    <div class="group/volume hidden items-center sm:flex">
      <a-media-mute class="grid h-9 w-9 flex-none place-items-center rounded-md transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:-outline-offset-2 active:bg-zinc-200 active:transition-none [&>span]:flex">
        <span slot="mute"><Icon name="volume" /><span class="sr-only">Mute</span></span>
        <span slot="unmute"><Icon name="volume-off" /><span class="sr-only">Unmute</span></span>
      </a-media-mute>

      <a-media-volume
        label="Volume"
        class="w-0 opacity-0 transition-[width,opacity,margin] duration-200 group-focus-within/volume:mx-2 group-focus-within/volume:w-16 group-focus-within/volume:opacity-100 group-hover/volume:mx-2 group-hover/volume:w-16 group-hover/volume:opacity-100 [--range-handle-background:var(--color-zinc-900)] [--range-handle-size:0.75rem] [--range-outline-color:var(--color-zinc-900)] [--range-progress-background:var(--color-zinc-900)] [--range-track-background:var(--color-zinc-300)] [--range-track-padding:0.5rem_0] [--range-track-height:0.25rem]"
      />
    </div>
  </a-media>
</template>

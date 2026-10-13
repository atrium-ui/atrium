<script setup lang="ts">
import "@atrium-ui/elements/video";
import "@videojs/html/video/player";
import "@videojs/html/ui/container";
import "@videojs/html/ui/controls";
import "@videojs/html/ui/gesture";
import "@videojs/html/ui/hotkey";
import "@videojs/html/ui/status-indicator";
import { twMerge } from "tailwind-merge";
import Icon from "./Icon.vue";

const props = defineProps<{
  src: string;
  label: string;
  poster?: string;
  class?: string;
}>();
</script>

<template>
  <video-player class="contents">
    <media-container
      :aria-label="label"
      :class="
        twMerge(
          'relative block aspect-video w-full overflow-hidden rounded-md bg-black font-sans text-white focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2',
          props.class,
        )
      "
    >
      <video
        :src="src"
        :poster="poster"
        playsinline
        preload="metadata"
        class="block h-full w-full object-contain"
      >
        <slot />
      </video>

      <media-gesture type="tap" action="togglePaused" />
      <media-gesture type="doubletap" action="toggleFullscreen" />
      <media-hotkey keys="Space" action="togglePaused" />
      <media-hotkey keys="k" action="togglePaused" />
      <media-hotkey keys="m" action="toggleMuted" />
      <media-hotkey keys="f" action="toggleFullscreen" />
      <media-hotkey keys="ArrowLeft" action="seekStep" value="-5" />
      <media-hotkey keys="ArrowRight" action="seekStep" value="5" />

      <media-status-indicator
        actions="togglePaused toggleMuted"
        aria-hidden="true"
        class="group/status pointer-events-none absolute top-1/2 left-1/2 grid h-16 w-16 -translate-1/2 place-items-center rounded-full bg-black/50 text-3xl transition-[opacity,scale] duration-500 ease-out data-ending-style:scale-125 data-ending-style:opacity-0 data-starting-style:scale-75 data-starting-style:opacity-0 [&[hidden]]:hidden"
      >
        <Icon name="play" class="hidden group-data-[status=play]/status:block" />
        <Icon name="pause" class="hidden group-data-[status=pause]/status:block" />
        <Icon name="volume" class="hidden group-data-[status=volume-low]/status:block group-data-[status=volume-high]/status:block" />
        <Icon name="volume-off" class="hidden group-data-[status=volume-off]/status:block" />
      </media-status-indicator>

      <media-controls
        class="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-4 pt-16 pb-3 transition-opacity duration-300 has-[:focus-visible]:opacity-100 [&:not([data-visible])]:opacity-0"
      >
        <div role="group" aria-label="Video controls" data-interactive class="pointer-events-auto">
          <a-video-seek
            label="Seek"
            class="block w-full [--range-handle-background:white] [--range-handle-size:0.75rem] [--range-outline-color:white] [--range-progress-background:white] [--range-track-background:rgb(255_255_255/0.6)] [--range-track-padding:0.5rem_0] [--range-track-height:0.1875rem] hover:[--range-track-height:0.3125rem] [&::part(handle)]:origin-top-left [&::part(handle)]:scale-0 [&::part(handle)]:transition-[scale] hover:[&::part(handle)]:scale-100 focus-within:[&::part(handle)]:scale-100"
          />

          <div class="flex items-center gap-1 text-lg">
            <a-video-play class="grid h-9 w-9 flex-none place-items-center rounded-md transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white focus-visible:-outline-offset-2 active:bg-white/25 active:transition-none [&>span]:flex">
              <span slot="play"><Icon name="play" /><span class="sr-only">Play</span></span>
              <span slot="pause"><Icon name="pause" /><span class="sr-only">Pause</span></span>
            </a-video-play>

            <div class="group/volume flex items-center">
              <a-video-mute class="grid h-9 w-9 flex-none place-items-center rounded-md transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white focus-visible:-outline-offset-2 active:bg-white/25 active:transition-none [&>span]:flex">
                <span slot="mute"><Icon name="volume" /><span class="sr-only">Mute</span></span>
                <span slot="unmute"><Icon name="volume-off" /><span class="sr-only">Unmute</span></span>
              </a-video-mute>

              <a-video-volume
                label="Volume"
                class="w-0 opacity-0 transition-[width,opacity,margin] duration-200 group-focus-within/volume:mx-2 group-focus-within/volume:w-16 group-focus-within/volume:opacity-100 group-hover/volume:mx-2 group-hover/volume:w-16 group-hover/volume:opacity-100 [--range-handle-background:white] [--range-handle-size:0.75rem] [--range-outline-color:white] [--range-progress-background:white] [--range-track-background:rgb(255_255_255/0.6)] [--range-track-padding:0.5rem_0] [--range-track-height:0.25rem]"
              />
            </div>

            <div class="mx-1 flex-none text-sm text-white/90">
              <a-video-time type="current" />
              <span class="mx-1 text-white/60">/</span>
              <a-video-time type="duration" class="text-white/60" />
            </div>

            <a-video-fullscreen class="ml-auto grid h-9 w-9 flex-none place-items-center rounded-md transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white focus-visible:-outline-offset-2 active:bg-white/25 active:transition-none [&>span]:flex">
              <span slot="enter"><Icon name="fullscreen" /><span class="sr-only">Enter fullscreen</span></span>
              <span slot="exit"><Icon name="fullscreen-exit" /><span class="sr-only">Exit fullscreen</span></span>
            </a-video-fullscreen>
          </div>
        </div>
      </media-controls>
    </media-container>
  </video-player>
</template>

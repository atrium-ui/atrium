/* @jsxImportSource vue */

import "@sv/elements/track";
import type { Track } from "@sv/elements/track";
import { computed, defineComponent, ref } from "vue";
import { Button } from "./Button";
import { Icon } from "./Icon";

export const Slider = defineComponent((_, { slots }) => {
  const track = ref<Track>();
  const current = ref(0);
  const position = ref(0);
  const itemCount = ref(0);
  const overflowWidth = ref(0);
  const showDots = computed(() => {
    return overflowWidth.value > 0;
  });
  const showNext = computed(() => {
    return (
      overflowWidth.value > 0 && current.value < (track.value?.children.length || 0) - 1
    );
  });
  const showPrevious = computed(() => {
    return overflowWidth.value > 0 && current.value > 0;
  });

  const progress = computed(() => {
    const width = track.value?.trackWidth || 0;
    const stepSize = width / itemCount.value;
    return Math.min(1, Math.max(0, (position.value || 0) / (width - stepSize)));
  });

  return () => (
    <div class="group relative w-full overflow-hidden">
      <div class="relative">
        <Button
          variant="ghost"
          class={[
            "-translate-y-1/2 absolute top-1/2 left-4 z-10 hidden transform text-2xl opacity-0 transition-all lg:block",
            showPrevious.value ? "group-hover:opacity-100" : "cursor-default opacity-0",
          ]}
          onClick={() => track.value?.moveBy(-1)}
        >
          <Icon name="arrow-left" />
        </Button>
        <Button
          variant="ghost"
          class={[
            "-translate-y-1/2 absolute top-1/2 right-4 z-10 hidden transform text-2xl opacity-0 transition-all lg:block",
            showNext.value ? "group-hover:opacity-100" : "cursor-default opacity-0",
          ]}
          onClick={() => track.value?.moveBy(1)}
        >
          <Icon name="arrow-right" />
        </Button>

        <a-track
          ref={track}
          class="flex w-full overflow-visible"
          overflowscroll
          snap
          onScroll={() => {
            position.value = track.value?.position.x || 0;
          }}
          onChange={() => {
            current.value = track.value?.currentItem || 0;
          }}
          onFormat={(e) => {
            overflowWidth.value = track.value?.overflowWidth || 0;
            itemCount.value = track.value?.children.length || 0;
          }}
        >
          {slots.default?.()}
        </a-track>
      </div>

      <div class={"flex h-0 justify-center pt-4 pb-4"}>
        {showDots.value && (
          <div
            class="relative flex h-[2px] w-[400px] items-center bg-[rgba(255,255,255,30%)]"
            style={{
              "--value": progress.value,
            }}
          >
            <div class="absolute left-[calc(var(--value)*100%-var(--value)*75px)] h-[4px] w-[75px] rounded-md bg-white transition-none" />
          </div>
        )}
      </div>
    </div>
  );
});

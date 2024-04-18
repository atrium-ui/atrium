/* @jsxImportSource vue */

import "@sv/elements/track";
import type { Track } from "@sv/elements/track";
import { computed, defineComponent, ref, onMounted } from "vue";
import { twMerge } from "tailwind-merge";
import { Button } from "./Button";
import { Icon } from "./Icon";

export const Slider = defineComponent(
  (_, { slots }) => {
    const track = ref<Track>();
    const current = ref(0);
    const width = ref(0);
    const position = ref(0);
    const itemCount = ref(1);
    const overflowWidth = ref(0);

    const showNext = computed(() => position.value < overflowWidth.value);
    const showPrev = computed(() => position.value > 100);

    const progress = computed(() => {
      const value = position.value / (width.value - width.value / itemCount.value);
      return Math.min(1, Math.max(0, value));
    });

    onMounted(() => {
      track.value?.shadowRoot?.addEventListener("slotchange", (e) => {
        track.value?.moveTo(0, "none");
      });
      updateOverflow();
    });

    const next = () => {
      const itemWidth = (track.value?.children[0] as HTMLElement)?.offsetWidth;
      const pageItemCount = Math.round((track.value?.width || 0) / itemWidth);
      track.value?.moveTo(
        Math.min(current.value + pageItemCount, itemCount.value - pageItemCount),
      );
    };

    const prev = () => {
      const itemWidth = (track.value?.children[0] as HTMLElement)?.offsetWidth;
      const pageItemCount = Math.round((track.value?.width || 0) / itemWidth) * -1;
      track.value?.moveBy(pageItemCount);
    };

    const updateOverflow = () => {
      overflowWidth.value = track.value?.overflowWidth || 0;
      itemCount.value = track.value?.children.length || 1;
      position.value = track.value?.position.x || 0;
      width.value = track.value?.trackWidth || 0;
    };

    return () => (
      <div class="@container group relative w-full overflow-hidden px-4">
        <div class="relative w-full">
          <Button
            variant="ghost"
            inert={!showPrev.value}
            class={[
              "-translate-y-1/2 absolute top-1/2 z-10 hidden transform opacity-0 transition-all lg:block focus-visible:opacity-100",
              showPrev.value ? "group-hover:opacity-100" : "opacity-0",
              "left-[12px]",
            ]}
            onClick={prev}
            label="Previous page"
          >
            <Icon class="block" name="arrow-left" />
          </Button>
          <Button
            variant="ghost"
            inert={!showNext.value}
            class={[
              "-translate-y-1/2 absolute top-1/2 z-10 hidden transform opacity-0 transition-all lg:block focus-visible:opacity-100",
              showNext.value ? "group-hover:opacity-100" : "opacity-0",
              "right-[12px]",
            ]}
            onClick={next}
            label="Next page"
          >
            <Icon class="block" name="arrow-right" />
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
              e.preventDefault();
              updateOverflow();
            }}
          >
            {slots.default?.()}
          </a-track>
        </div>

        <div class="flex justify-center py-5 @lg:py-8">
          <div
            class={twMerge(
              "relative flex h-[2px] w-[200px] items-center bg-[rgba(255,255,255,30%)] @lg:w-[400px]",
              overflowWidth.value > 0 ? "opacity-100" : "opacity-0",
            )}
            style={{
              "--value": progress.value,
            }}
          >
            <div
              class={[
                "-top-[1px] absolute left-[calc(var(--value)*100%-var(--value)*75px)] h-[4px] w-[75px]",
                "rounded-md bg-white transition-none",
              ]}
            />
          </div>
        </div>
      </div>
    );
  },
  {
    name: "Slider",
  },
);

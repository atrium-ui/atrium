/* @jsxImportSource vue */
import "@sv/elements/track";
import type { Track } from "@sv/elements/track";
import { twMerge } from "tailwind-merge";
import { computed, defineComponent, onMounted, ref } from "vue";
import { Button } from "./Button";
import { Icon } from "./Icon";

export const Slider = defineComponent(
  (props: { class?: string }, { slots }) => {
    const track = ref<Track>();
    const current = ref(0);
    const position = ref(0);
    const meta = ref({
      overflowWidth: 0,
      itemCount: 0,
      width: 0,
    });

    const progress = computed(() => {
      const value =
        1 - (meta.value.overflowWidth - position.value) / meta.value.overflowWidth;
      return Math.min(1, Math.max(0, value));
    });

    const showNext = computed(
      () => Math.round(position.value) < meta.value.overflowWidth,
    );
    const showPrev = computed(() => position.value >= 100);

    onMounted(() => {
      // reset the position when the items change
      track.value?.shadowRoot?.addEventListener("slotchange", (e) => {
        track.value?.moveTo(0, "none");
      });
    });

    const next = () => {
      const itemWidth = (track.value?.children[0] as HTMLElement)?.offsetWidth;
      const pageItemCount = Math.round((track.value?.width || 0) / itemWidth);
      track.value?.moveTo(
        Math.min(current.value + pageItemCount, meta.value.itemCount - pageItemCount),
      );
    };
    const prev = () => {
      const itemWidth = (track.value?.children[0] as HTMLElement)?.offsetWidth;
      const pageItemCount = Math.round((track.value?.width || 0) / itemWidth) * -1;
      track.value?.moveBy(pageItemCount);
    };

    return () => (
      <div
        class={twMerge("@container group relative w-full overflow-hidden", props.class)}
      >
        <div class="relative w-full">
          <Button
            disabled={!showPrev.value}
            class={[
              "-translate-y-1/2 absolute top-1/2 left-[12px] z-10 hidden transform transition-all focus-visible:opacity-100 lg:block",
              showPrev.value ? "group-hover:opacity-100" : "opacity-0",
              "text-black dark:text-white",
            ]}
            onClick={prev}
            label="Previous page"
          >
            <Icon class="block drop-shadow-[2px_2px_6px_black]" name="arrow-left" />
          </Button>
          <Button
            disabled={!showNext.value}
            class={[
              "-translate-y-1/2 absolute top-1/2 right-[12px] z-10 hidden transform transition-all focus-visible:opacity-100 lg:block",
              showNext.value ? "group-hover:opacity-100" : "opacity-0",
              "text-black dark:text-white",
            ]}
            onClick={next}
            label="Next page"
          >
            <Icon class="block drop-shadow-[2px_2px_6px_black]" name="arrow-right" />
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
              position.value = track.value?.position.x || 0;
              meta.value = {
                itemCount: track.value?.children.length || 0,
                width: track.value?.trackWidth || 0,
                overflowWidth: track.value?.overflowWidth || 0,
              };
            }}
          >
            {slots.default?.()}
          </a-track>
        </div>

        <div class="flex justify-center @lg:py-8 pt-5 pb-2">
          <div
            class={twMerge(
              "relative flex h-[2px] @lg:w-[400px] w-[200px] items-center bg-[rgba(0,0,0,30%)] drak:bg-[rgba(255,255,255,30%)]",
              meta.value.overflowWidth > 0 ? "opacity-100" : "opacity-0",
            )}
            style={{
              "--value": progress.value,
            }}
          >
            <div
              class={[
                "-top-[1px] absolute left-[calc(var(--value)*100%-var(--value)*75px)] h-[4px] w-[75px]",
                "rounded-md bg-black transition-none dark:bg-white",
              ]}
            />
          </div>
        </div>
      </div>
    );
  },
  {
    name: "Slider",
    props: ["class"],
  },
);

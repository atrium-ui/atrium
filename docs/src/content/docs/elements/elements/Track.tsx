/* @jsxImportSource vue */

import { defineComponent, onMounted, ref } from "vue";

export const VariableTrack = defineComponent(() => {
  const count = ref(10);

  const track = ref();
  const position = ref(0);
  const overflowWidth = ref(0);

  const sync = () => {
    position.value = track.value?.position.x;
    overflowWidth.value = track.value?.overflowWidth;
  };

  onMounted(() => {
    track.value?.addEventListener("format", sync);
    track.value?.addEventListener("scroll", sync);
  });

  return () => {
    return (
      <div class="relative">
        <span>Child count: </span>{" "}
        <input
          type="number"
          class="my-4 w-12"
          value={count.value}
          onInput={
            ((e: InputEvent) => {
              count.value = (e.currentTarget as HTMLInputElement).valueAsNumber;
            }) as EventListener
          }
        />
        <a-track ref={track} overflowscroll snap class="flex max-w-[100vw]">
          {new Array(count.value).fill(1).map((_, i) => {
            return (
              // biome-ignore lint/a11y/useValidAnchor: <explanation>
              <a href="javascript:(null)" class="block flex-none pr-4" key={i}>
                <canvas width={260} height={280} class="bg-slate-500" />
              </a>
            );
          })}
        </a-track>
        <div class="pointer-events-none absolute top-1/2 right-0 left-0 mx-[-10px] flex justify-between">
          <span>
            <button type="button" class={[position.value < 10 ? "hidden" : "block"]}>
              {"<"}
            </button>
          </span>
          <span>
            <button
              type="button"
              class={[overflowWidth.value - position.value > 0 ? "block" : "hidden"]}
            >
              {">"}
            </button>
          </span>
        </div>
      </div>
    );
  };
});

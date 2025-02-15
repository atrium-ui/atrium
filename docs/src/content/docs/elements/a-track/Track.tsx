/* @jsxImportSource vue */

import { defineComponent, onMounted, ref } from "vue";

export const VariableTrack = defineComponent(() => {
  const count = ref(10);

  const track = ref();
  const position = ref(0);
  const itemWidth = ref(360);
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
      <div class="not-content relative">
        <div class="my-4 grid grid-cols-3 gap-2">
          <div>
            <span>Child count: </span>
            <input
              min={1}
              type="number"
              class="w-12"
              value={count.value}
              onInput={
                ((e: InputEvent) => {
                  count.value = (e.currentTarget as HTMLInputElement).valueAsNumber;
                }) as EventListener
              }
            />
          </div>
          <div>
            <span>Item width: </span>
            <input
              type="number"
              class="w-20"
              value={itemWidth.value}
              onInput={
                ((e: InputEvent) => {
                  itemWidth.value = (e.currentTarget as HTMLInputElement).valueAsNumber;
                }) as EventListener
              }
            />
          </div>
        </div>
        <a-track ref={track} overflowscroll snap class="flex max-w-[100vw]" debug>
          {new Array(count.value || 1).fill(1).map((_, i) => {
            return (
              <div class="counted flex-none pr-2" key={i}>
                <canvas width={itemWidth.value} height={280} class="bg-slate-500" />
              </div>
            );
          })}
          <div class="flex-none">
            <canvas width={125} height={280} class="bg-slate-500" />
          </div>
        </a-track>
        <div class="pointer-events-none absolute top-1/2 right-0 left-0 mx-[-10px] flex justify-between">
          <span>
            <button
              type="button"
              class={[position.value < 10 ? "hidden" : "block", "pointer-events-auto"]}
              onClick={() => {
                track.value?.moveBy(-1, "linear");
              }}
            >
              {"<"}
            </button>
          </span>
          <span>
            <button
              type="button"
              class={[
                overflowWidth.value - position.value > 0 ? "block" : "hidden",
                "pointer-events-auto",
              ]}
              onClick={() => {
                if (track.value?.currentIndex >= track.value?.maxIndex) {
                  track.value?.setTarget([track.value?.overflowWidth, 0]);
                } else {
                  track.value?.moveBy(1, "linear");
                }
              }}
            >
              {">"}
            </button>
          </span>
        </div>
      </div>
    );
  };
});

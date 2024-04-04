import { Slider } from "@sv/components/src/Slider.vue";

export default function () {
  return (
    <Slider>
      <div class="h-[400px] w-full flex-none p-2">
        <div class="h-full w-full bg-zinc-400" />
      </div>
      <div class="h-[400px] w-full flex-none p-2">
        <div class="h-full w-full bg-zinc-400" />
      </div>
      <div class="h-[400px] w-full flex-none p-2">
        <div class="h-full w-full bg-zinc-400" />
      </div>
    </Slider>
  );
}

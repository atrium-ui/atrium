/* @jsxImportSource vue */
import { Button } from "@components/src/vue/Button";
import { Icon } from "@components/src/vue/Icon";
import { onMounted, ref, defineComponent } from "vue";

export const Browser = defineComponent(() => {
  const mounted = ref(false);

  onMounted(() => {
    setTimeout(() => {
      mounted.value = true;
    }, 250);
  });

  return () => (
    <div
      class={[
        "transition-all duration-300 ease-in-out",
        mounted.value ? "opacity-100" : "translate-y-5 opacity-0",
      ]}
    >
      <div class="relative overflow-hidden rounded-xl border border-zinc-950 border-b-0 bg-[#18181a] shadow-xl 2xl:mx-[-220px] xl:mx-[-80px]">
        <div class="flex w-full p-2 pl-10">
          <Button
            variant="disabled"
            class="min-w-[180px] rounded-none rounded-t-md border-none bg-[#26262A] px-4 py-1 text-base"
          >
            Example
          </Button>
        </div>

        <div class="grid w-full grid-cols-[auto_1fr_200px] gap-2 p-2 pb-4">
          <div class="flex">
            <Button variant="disabled" class="bg-transparent py-2">
              <Icon name="arrow-left" />
            </Button>
            <Button variant="disabled" class="bg-transparent py-2">
              <Icon name="arrow-right" />
            </Button>
            <Button variant="disabled" class="bg-transparent py-2">
              <Icon name="reload" />
            </Button>
          </div>

          <div class="rounded-md bg-[#26262A]" />
        </div>

        <iframe
          title="showcase"
          src="/atrium/showcase"
          class="m-0 h-[600px] w-full bg-[#26262a]"
        />

        <div class="pointer-events-none absolute bottom-0 left-0 h-[150px] w-full bg-[linear-gradient(0deg,var(--sl-color-black),transparent)]" />
      </div>
    </div>
  );
});

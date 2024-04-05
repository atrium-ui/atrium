/* @jsxImportSource vue */

import { defineComponent, onMounted, onUpdated, ref } from "vue";
import "@sv/elements/blur";
import { Track, Trait } from "@sv/elements/track";
import { Button } from "./Button.jsx";

class DrawerTrait extends Trait {
  input() {
    if (this.entity.position.y > window.innerHeight / 2) {
      this.entity.dispatchEvent(new Event("open", { bubbles: true }));
    }
  }
}

class DrawerTrack extends Track {
  connectedCallback(): void {
    super.connectedCallback();

    const pointer = this.findTrait<any>("pointer");
    if (pointer) {
      pointer.borderResistnce = 0;
    }

    this.addTrait("drawer", DrawerTrait);
  }
}

customElements.define("drawer-track", DrawerTrack);

interface Props {
  minimized: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const Drawer = defineComponent<Props>(
  (props, { slots }) => {
    const drawer = ref<DrawerTrack>();

    const update = () => {
      if (props.minimized) {
        drawer.value?.moveTo(0, "linear");
      } else {
        drawer.value?.setTarget([0, drawer.value?.overflowHeight], "linear");
      }
    };

    onMounted(() => {
      requestAnimationFrame(() => update());
    });
    onUpdated(() => update());

    return () => (
      <div class="drawer group/blur pointer-events-none fixed top-0 left-0 z-50 block h-full w-full overflow-hidden transition-all">
        <drawer-track
          ref={drawer}
          vertical
          class="auto -translate-x-1/2 pointer-events-auto absolute bottom-0 left-1/2 z-50 h-[100px] translate-y-0 touch-none overflow-visible transition-all"
          onOpen={() => props.onOpen?.()}
        >
          <div class="relative w-[calc(100vw)] min-w-[250px] max-w-[500px] rounded-t-lg border border-zinc-100 border-b-0 bg-zinc-800 pt-4">
            <div class="flex w-full justify-center pb-4">
              <div class="h-[3px] w-[60px] rounded-3xl bg-[#002417] opacity-20" />
            </div>

            <Button
              class="absolute top-0 right-0 bg-white text-xs"
              onClick={() => props.onClose?.()}
            >
              X
            </Button>

            <div class={["relative z-10"]}>{slots.title?.()}</div>
          </div>

          <div
            class={[
              "relative z-10 w-[calc(100vw)] min-w-[250px] max-w-[500px] bg-zinc-800",
            ]}
          >
            {slots.default?.()}

            <div class="absolute top-full left-0 h-[50vh] w-full bg-zinc-800" />
          </div>
        </drawer-track>
      </div>
    );
  },
  { props: ["minimized", "onClose", "onOpen"] },
);

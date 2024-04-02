import "@sv/elements/blur";
import { Track, Trait } from "@sv/elements/track";
import type { PointerTrait } from "../../elements/packages/track/src/Track.js";

customElements.define(
  "drawer-track",
  class extends Track {
    connectedCallback(): void {
      super.connectedCallback();

      const pointer = this.findTrait<PointerTrait>("pointer");
      if (pointer) {
        pointer.borderResistance = 0;
      }

      this.addTrait(
        "drawer",
        class extends Trait {
          input() {
            if (this.entity.position.y < this.entity.offsetHeight * -1 + 40) {
              this.entity.dispatchEvent(new Event("close", { bubbles: true }));
            }
          }
        },
      );
    }
  },
);

interface Props {
  children?: JSX.Element | string;
  enabled: boolean;
  onBlur?: () => void;
}

export function Drawer(props: Props, context) {
  return (
    <a-blur
      enabled={props.enabled === true ? true : undefined}
      class="group/blur fixed top-0 left-0 z-50 block h-full w-full transition-all [&[enabled]]:bg-[#1C1C1C33] [&[enabled]]:backdrop-blur-md"
      onBlur={() => props.onBlur?.()}
    >
      <drawer-track
        vertical
        class="-translate-x-1/2 fixed bottom-0 left-1/2 z-50 translate-y-full overflow-visible opacity-0 transition-all group-[&[enabled]]/blur:block group-[&[enabled]]/blur:translate-y-0 group-[&[enabled]]/blur:opacity-100"
        onClose={() => props.onBlur?.()}
      >
        <div class="w-[calc(100vw-20px)] min-w-[250px] max-w-[500px] rounded-t-lg border border-zinc-700 border-b-0 bg-zinc-800 px-8 py-4">
          <div class="flex w-full justify-center pb-4">
            <div class="h-[4px] w-[100px] rounded-3xl bg-white opacity-50" />
          </div>

          {props.children}
        </div>
      </drawer-track>
    </a-blur>
  );
}

/* @jsxImportSource vue */

import { defineComponent, ref } from "vue";
import "@sv/elements/blur";
import {
  PointerTrait,
  Track,
  type InputState,
  type Easing,
  type Trait,
} from "@sv/elements/track";

export const Drawer = defineComponent(
  (
    props: {
      onClose?: () => void;
      onOpen?: () => void;
    },
    { slots },
  ) => {
    const drawer = ref<DrawerTrack>();
    const open = ref(false);

    return () => (
      <div class="drawer group/blur pointer-events-none fixed top-0 left-0 z-50 block h-full w-full overflow-hidden transition-all">
        <a-drawer
          ref={drawer}
          class="-translate-x-1/2 absolute bottom-0 left-1/2 h-[100px] max-w-[800px] translate-y-0 touch-none overflow-visible transition-all"
          onOpen={() => {
            open.value = true;
            props.onOpen?.();
          }}
          onClose={() => {
            open.value = false;
            props.onClose?.();
          }}
        >
          <div class="pointer-events-auto h-[calc(100vh-88px+26px)] w-full rounded-t-lg bg-zinc-800">
            <div class="flex w-full justify-center py-3">
              <div class="h-[2px] w-[40px] rounded-3xl bg-white" />
            </div>

            <div
              class={[
                "h-[calc(100vh-88px+26px)] pt-4",
                open.value ? "overflow-auto" : "overflow-hidden",
              ]}
            >
              {slots.default?.()}
            </div>
          </div>
        </a-drawer>
      </div>
    );
  },
  { props: ["onClose", "onOpen"] },
);

class DrawerTrack extends Track {
  public traits: Trait[] = [
    new PointerTrait(),
    {
      id: "drawer",
      input(track: DrawerTrack, inputState: InputState) {
        const step = window.innerHeight - 200;
        if (track.position.y > step && !track.isOpen) {
          track.setOpen(true);
        }
        if (track.position.y < step && track.isOpen) {
          track.setOpen(false);
        }

        if (!track.grabbing && track.velocity.abs() < 6 && inputState.release.value) {
          if (track.position.y > 450) {
            // fully open
            track.setTarget([0, track.overflowHeight], "linear");
          } else if (track.position.y > 40) {
            // full preview
            track.setTarget([0, 200], "linear");
          } else {
            // collapsed preview
            track.setTarget([0, 30], "linear");
          }
        }
      },
    },
  ];

  transitionTime = 200;
  isOpen = false;

  constructor() {
    super();

    this.vertical = true;
  }

  setOpen(value: boolean) {
    this.isOpen = value;
    if (value === true) {
      this.dispatchEvent(new Event("open", { bubbles: true }));
    } else {
      this.dispatchEvent(new Event("close", { bubbles: true }));
    }
  }

  open(ease: Easing = "linear") {
    this.setTarget([0, this.overflowHeight], ease);
  }

  preview(ease: Easing = "linear") {
    this.setTarget([0, 200], ease);
  }

  close(ease: Easing = "linear") {
    this.setTarget([0, 30], ease);
  }
}

customElements.define("a-drawer", DrawerTrack);

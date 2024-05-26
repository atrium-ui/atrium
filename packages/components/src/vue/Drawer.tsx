/* @jsxImportSource vue */
import { defineComponent, ref, onMounted, effect, nextTick } from "vue";
import {
  PointerTrait,
  Track,
  type InputState,
  type Easing,
  type Trait,
} from "@sv/elements/track";
import { Button } from "./Button";
import { Icon } from "./Icon";

export const Drawer = defineComponent(
  (
    props: {
      disabled?: boolean;
      dynamicHeight?: boolean;
      open?: boolean;
      // X to close was pressed
      onClose?: () => void;
      // Drawer was pushed down
      onCollapse?: () => void;
      // // when the drawer is pushed down
      // onCollapse: () => void;
      // when the drawer is pulled up
      onOpen?: () => void;
    },
    { slots },
  ) => {
    const open = ref(props.open ?? false);
    const drawer = ref<DrawerTrack>();
    const scrollContainer = ref<HTMLDivElement>();
    const contentContainer = ref<HTMLDivElement>();
    const drawerHeight = ref<number>();

    effect(() => {
      if (props.open === true) {
        open.value = true;
      }
    });

    onMounted(() => {
      requestAnimationFrame(async () => {
        drawerHeight.value = contentContainer.value?.offsetHeight;

        await nextTick();
        // default state should always be half open
        drawer.value?.minimize();
      });
    });

    return () => (
      <div class="drawer group/blur -translate-x-1/2 pointer-events-none fixed top-0 left-1/2 z-50 block h-full w-full max-w-[700px] overflow-hidden transition-all">
        <drawer-track
          contentheight={props.dynamicHeight ? drawerHeight.value : undefined}
          ref={drawer}
          class="block h-full w-full translate-y-0 touch-none transition-all"
          onOpen={() => {
            open.value = true;
            props.onOpen?.();
          }}
          onClose={() => {
            open.value = false;
            scrollContainer.value?.scrollTo(0, 0);
            props.onCollapse?.();
          }}
          onMove={(e: Event) => {
            if (props.disabled) e.preventDefault();
            if (
              scrollContainer.value &&
              scrollContainer.value?.scrollTop > 10 &&
              open.value === true
            ) {
              e.preventDefault();
            }
          }}
          onFormat={(e: Event) => e.preventDefault()}
        >
          <div class="h-[calc(100vh)] w-full" />

          <div class="pointer-events-auto relative rounded-t-lg bg-zinc-800">
            <div class="flex w-full justify-center py-3">
              {!props.disabled && (
                <div class="h-[2px] w-[40px] rounded-3xl bg-emerald-100" />
              )}
            </div>

            <div
              ref={scrollContainer}
              data-scroll-container
              class={[
                "h-[calc(100vh-env(safe-area-inset-top))] touch-auto",
                open.value ? "overflow-auto" : "overflow-hidden",
              ]}
            >
              <div ref={contentContainer}>{slots.default?.()}</div>
            </div>

            {(!open.value || props.disabled) && (
              <Button
                variant="ghost"
                class="absolute top-3 right-3 h-auto w-auto text-xs"
                onClick={() => {
                  drawer.value?.close();

                  setTimeout(() => {
                    props.onClose?.();
                  }, 16);
                }}
              >
                <Icon name="close" />
              </Button>
            )}
          </div>
        </drawer-track>
      </div>
    );
  },
  { props: ["disabled", "dynamicHeight", "open", "onClose", "onCollapse", "onOpen"] },
);

class DrawerTrack extends Track {
  public traits: Trait[] = [
    new PointerTrait(),
    {
      id: "drawer",
      input(track: DrawerTrack, inputState: InputState) {
        const openThreshold = window.innerHeight - 400;

        if (track.position.y > openThreshold && !track.isOpen) {
          track.setOpen(true);
        }
        if (track.position.y < openThreshold && track.isOpen) {
          track.setOpen(false);
        }

        if (inputState.release.value && track.velocity.abs() < 3) {
          if (track.position.y > 400) {
            track.open();
          } else if (track.position.y > 40) {
            track.minimize();
          } else {
            track.close();
          }
        }
      },
    },
  ];

  transitionTime = 350;
  drag = 0.98;
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
    this.setTarget(this.getToItemPosition(1), ease);
  }

  minimize(ease: Easing = "linear") {
    let height = 200;
    if (this.hasAttribute("contentheight")) {
      const value = this.getAttribute("contentheight");
      const valueInt = value ? +value : Number.NaN;
      const openedPosition = this.getToItemPosition(1);
      height = valueInt > openedPosition.y ? openedPosition.y : valueInt;
    }

    this.setTarget([0, height], ease);
  }

  close(ease: Easing = "linear") {
    this.setTarget([0, 30], ease);
  }
}

customElements.define("drawer-track", DrawerTrack);

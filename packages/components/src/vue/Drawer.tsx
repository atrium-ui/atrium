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

          <div class="pointer-events-auto relative rounded-t-lg bg-zinc-50 dark:bg-zinc-800">
            <div class="flex w-full justify-center py-3">
              {!props.disabled && (
                <div class="h-[3px] w-[50px] rounded-3xl bg-zinc-200" />
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

export class DrawerTrack extends Track {
  public traits: Trait[] = [
    new PointerTrait(),
    {
      id: "drawer",
      input(track: DrawerTrack, inputState: InputState) {
        const openThresholdFixed = window.innerHeight / 2;
        const openThreshold = window.innerHeight - openThresholdFixed;

        if (track.position.y > openThreshold && !track.isOpen) {
          track.setOpen(true);
        }
        if (track.position.y < openThreshold && track.isOpen) {
          track.setOpen(false);
        }

        if (track.grabbing || track.target) return;
        if (track.deltaVelocity.y >= 0) return;
        if (track.isStatic) return;

        const vel = Math.round(track.lastVelocity[track.currentAxis] * 10) / 10;
        const power = Math.round(vel / 15);

        if (power < 0) {
          track.minimize();
        } else if (power > 0) {
          track.open();
        } else {
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

  contentheight?: number;

  get isStatic() {
    return !!this.contentheight;
  }

  constructor() {
    super();
    this.vertical = true;
  }

  static get properties() {
    return {
      ...Track.properties,
      contentheight: { type: Number, reflect: true },
    };
  }

  setOpen(value: boolean) {
    this.isOpen = value;

    // dely event to prevent jank
    if (value === true) {
      this.dispatchEvent(new Event("open", { bubbles: true }));
    } else {
      this.dispatchEvent(new Event("close", { bubbles: true }));
    }
  }

  open(ease: Easing = "linear") {
    this.acceleration.mul(0.25);
    this.inputForce.mul(0.125);
    this.setTarget(this.getToItemPosition(1), ease);
  }

  minimize(ease: Easing = "linear") {
    let height = 200;
    if (this.isStatic) {
      const value = this.getAttribute("contentheight");
      const valueInt = value ? +value : Number.NaN;
      const openedPosition = this.getToItemPosition(1);
      height = valueInt > openedPosition.y ? openedPosition.y : valueInt;
    }

    this.acceleration.mul(0.25);
    this.inputForce.mul(0.125);
    this.setTarget([0, height], ease);
  }

  close(ease: Easing = "linear") {
    this.acceleration.mul(0.25);
    this.inputForce.mul(0.125);
    this.setTarget([0, 30], ease);
  }
}

customElements.define("drawer-track", DrawerTrack);

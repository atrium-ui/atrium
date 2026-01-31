<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import { Track, type InputState, type Easing, type Trait } from "@sv/elements/track";
import Button from "./Button.vue";
import Icon from "./Icon.vue";

const props = defineProps<{
  disabled?: boolean;
  dynamicHeight?: boolean;
  open?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  collapse: [];
  open: [];
}>();

const isOpen = ref(props.open ?? false);
const drawer = ref<DrawerTrack>();
const scrollContainer = ref<HTMLDivElement>();
const contentContainer = ref<HTMLDivElement>();
const drawerHeight = ref<number>();

watch(
  () => props.open,
  (newValue) => {
    if (newValue === true) {
      isOpen.value = true;
    }
  },
);

onMounted(() => {
  requestAnimationFrame(async () => {
    drawerHeight.value = contentContainer.value?.offsetHeight;

    await nextTick();
    drawer.value?.minimize();
  });
});

function handleOpen() {
  isOpen.value = true;
  emit("open");
}

function handleClose() {
  isOpen.value = false;
  scrollContainer.value?.scrollTo(0, 0);
  emit("collapse");
}

function handleMove(e: Event) {
  if (props.disabled) e.preventDefault();
  if (
    scrollContainer.value &&
    scrollContainer.value?.scrollTop > 10 &&
    isOpen.value === true
  ) {
    e.preventDefault();
  }
}

function handleFormat(e: Event) {
  e.preventDefault();
}

function handleCloseClick() {
  drawer.value?.close();

  setTimeout(() => {
    emit("close");
  }, 16);
}

class DrawerTrack extends Track {
  public traits: Trait[] = [
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

        const vel = Math.round(track.velocity[track.currentAxis] * 10) / 10;
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

if (!customElements.get("drawer-track")) {
  customElements.define("drawer-track", DrawerTrack);
}
</script>

<template>
  <div class="drawer group/blur -translate-x-1/2 pointer-events-none fixed top-0 left-1/2 z-50 block h-full w-full max-w-[700px] overflow-hidden transition-all">
    <drawer-track
      ref="drawer"
      :contentheight="dynamicHeight ? drawerHeight : undefined"
      class="block h-full w-full translate-y-0 touch-none transition-all"
      @open="handleOpen"
      @close="handleClose"
      @move="handleMove"
      @format="handleFormat"
    >
      <div class="h-[calc(100vh)] w-full" />

      <div class="pointer-events-auto relative rounded-t-lg bg-zinc-50">
        <div class="flex w-full justify-center py-3">
          <div v-if="!disabled" class="h-[3px] w-[50px] rounded-3xl bg-zinc-200" />
        </div>

        <div
          ref="scrollContainer"
          data-scroll-container
          :class="[
            'h-[calc(100vh-env(safe-area-inset-top))] touch-auto',
            isOpen ? 'overflow-auto' : 'overflow-hidden',
          ]"
        >
          <div ref="contentContainer">
            <slot />
          </div>
        </div>

        <Button
          v-if="!isOpen || disabled"
          variant="ghost"
          class="absolute top-3 right-3 h-auto w-auto text-xs"
          @click="handleCloseClick"
        >
          <Icon name="close" />
        </Button>
      </div>
    </drawer-track>
  </div>
</template>

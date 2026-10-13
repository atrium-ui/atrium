<script setup lang="ts">
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { twMerge } from "tailwind-merge";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import Icon from "./Icon.vue";

const props = withDefaults(
  defineProps<{
    accessToken: string;
    lat: number;
    lng: number;
    label: string;
    zoom?: number;
    marker?: boolean;
    mapStyle?: string;
    class?: string;
  }>(),
  { zoom: 15, marker: true, mapStyle: "mapbox://styles/mapbox/streets-v12" },
);

const container = ref<HTMLElement>();
const markerElement = ref<HTMLElement>();
let map: mapboxgl.Map | undefined;
let mapMarker: mapboxgl.Marker | undefined;
const resizeObserver = new ResizeObserver(() => map?.resize());

onMounted(() => {
  if (!container.value) throw new Error("Map container is not mounted");

  map = new mapboxgl.Map({
    container: container.value,
    accessToken: props.accessToken,
    style: props.mapStyle,
    center: [props.lng, props.lat],
    zoom: props.zoom,
    cooperativeGestures: true,
    attributionControl: false,
    trackResize: false,
  });
  resizeObserver.observe(container.value);
  map.addControl(new mapboxgl.AttributionControl({ compact: true }));

  if (markerElement.value) {
    mapMarker = new mapboxgl.Marker({ element: markerElement.value, anchor: "bottom" })
      .setLngLat([props.lng, props.lat])
      .addTo(map);
  }
});

watch(
  () => [props.lng, props.lat, props.zoom] as const,
  ([lng, lat, zoom]) => {
    map?.easeTo({ center: [lng, lat], zoom });
    mapMarker?.setLngLat([lng, lat]);
  },
);

onBeforeUnmount(() => {
  resizeObserver.disconnect();
  map?.remove();
});
</script>

<template>
  <div
    :class="twMerge('relative aspect-square w-full overflow-hidden rounded-md bg-zinc-100', props.class)"
  >
    <div
      ref="container"
      role="region"
      :aria-label="label"
      class="h-full w-full [&_.mapboxgl-scroll-zoom-blocker]:bg-zinc-900/50! [&_.mapboxgl-scroll-zoom-blocker]:font-sans! [&_.mapboxgl-scroll-zoom-blocker]:text-sm! [&_.mapboxgl-touch-pan-blocker]:bg-zinc-900/50! [&_.mapboxgl-touch-pan-blocker]:font-sans! [&_.mapboxgl-touch-pan-blocker]:text-sm!"
    />

    <div v-if="marker" ref="markerElement">
      <slot name="marker">
        <div class="flex flex-col items-center">
          <div
            class="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-lg text-white shadow-lg ring-2 ring-white"
          >
            <Icon name="location" />
          </div>
          <div class="h-2.5 w-0.5 bg-zinc-900" />
        </div>
      </slot>
    </div>

    <div class="absolute top-3 right-3 z-[3] flex flex-col gap-2">
      <div
        class="flex flex-col divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5"
      >
        <button type="button" aria-label="Zoom in" title="Zoom in" class="grid h-9 w-9 cursor-pointer place-items-center border-0 bg-transparent text-lg text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:-outline-offset-2 active:bg-zinc-200 active:transition-none" @click="map?.zoomIn()">
          <Icon name="plus" />
        </button>
        <button type="button" aria-label="Zoom out" title="Zoom out" class="grid h-9 w-9 cursor-pointer place-items-center border-0 bg-transparent text-lg text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:-outline-offset-2 active:bg-zinc-200 active:transition-none" @click="map?.zoomOut()">
          <Icon name="minus" />
        </button>
      </div>
      <button
        type="button"
        aria-label="Center on location"
        title="Center on location"
        class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border-0 bg-white text-lg text-zinc-800 shadow-md ring-1 ring-black/5 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:-outline-offset-2 active:bg-zinc-200 active:transition-none"
        @click="map?.flyTo({ center: [lng, lat], zoom })"
      >
        <Icon name="location" />
      </button>
    </div>
  </div>
</template>

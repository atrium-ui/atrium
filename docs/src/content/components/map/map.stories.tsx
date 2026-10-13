/* @jsxImportSource vue */
import type { Story } from "@atrium-ui/astro-stories";
import MapView from "@components/src/vue/Map.vue";

const token =
  "pk.eyJ1IjoibHVja3lkeWUiLCJhIjoiY21lenM4em1yMHAwczJscjF0eDA1ODB1ayJ9.bx7zYl1if-gzkmic9ZmEpg";

export default {
  tags: ["public"],
  args: {},
} satisfies Story;

export const Default = {
  render: () => (
    <div class="flex min-h-[520px] w-full items-center justify-center p-10">
      <MapView
        class="max-w-md"
        accessToken={token}
        lat={52.5163}
        lng={13.3777}
        label="Map of the Brandenburg Gate"
      />
    </div>
  ),
};

export const Contact = {
  render: () => (
    <div class="flex min-h-[520px] w-full items-center justify-center p-10">
      <div class="grid w-full max-w-4xl items-center gap-8 md:grid-cols-[1fr_1.4fr]">
        <div class="font-sans">
          <div class="text-xs text-zinc-500 uppercase tracking-[0.14em]">Visit us</div>
          <h3 class="mt-2 mb-4 text-2xl text-zinc-900">Atrium Studio</h3>
          <address class="text-zinc-600 not-italic leading-relaxed">
            Pariser Platz
            <br />
            10117 Berlin
            <br />
            Germany
          </address>
          <p class="mt-4 text-sm text-zinc-500">Mon – Fri, 9:00 – 18:00</p>
        </div>
        <MapView
          class="aspect-[4/3]"
          accessToken={token}
          lat={52.5163}
          lng={13.3777}
          zoom={16}
          mapStyle="mapbox://styles/mapbox/light-v11"
          label="Location of Atrium Studio at Pariser Platz, Berlin"
        />
      </div>
    </div>
  ),
};

export const CustomMarker = {
  render: () => (
    <div class="flex min-h-[520px] w-full items-center justify-center p-10">
      <MapView
        class="max-w-md"
        accessToken={token}
        lat={48.8584}
        lng={2.2945}
        zoom={15.5}
        mapStyle="mapbox://styles/mapbox/light-v11"
        label="Map of the Eiffel Tower"
      >
        {{
          marker: () => (
            <div class="flex flex-col items-center">
              <div class="rounded-full bg-white px-3 py-1.5 font-sans text-sm text-zinc-900 shadow-lg ring-1 ring-black/5">
                Eiffel Tower
              </div>
              <div class="h-3 w-0.5 bg-white shadow" />
              <div class="h-2.5 w-2.5 rounded-full bg-zinc-900 ring-2 ring-white" />
            </div>
          ),
        }}
      </MapView>
    </div>
  ),
};

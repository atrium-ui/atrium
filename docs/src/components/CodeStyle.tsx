/* @jsxImportSource vue */

import { defineComponent, ref } from "vue";
import { Checkbox } from "@sv/components/src/vue/Checkbox";
import { Input } from "@sv/components/src/vue/Input";

export default defineComponent(() => {
  const args = ref(["editorconfig", "biome", "tsconfig"]);

  return () => (
    <div>
      <form
        class="not-content my-8"
        onChange={(e) => {
          const data = new FormData(e.currentTarget);
          args.value = [...data.keys()];
        }}
      >
        <div class="grid grid-cols-4">
          <Checkbox id="editorconfig" checked>
            editorconfig
          </Checkbox>
          <Checkbox id="biome" checked>
            biome
          </Checkbox>
          <Checkbox id="tsconfig" checked>
            tsconfig
          </Checkbox>
          <Checkbox id="prettier" checked>
            prettier
          </Checkbox>
        </div>
      </form>

      <div>
        <input
          class={[
            "w-full min-w-0 rounded-md border bg-transparent px-3 py-1 outline-none focus:border-zinc-500 hover:border-zinc-600",
          ]}
          readonly
          value={`npx @sv/codestyle ${args.value.join(" ")}`}
        />
      </div>
    </div>
  );
});

/* @jsxImportSource vue */

import { defineComponent, ref } from "vue";
import { Checkbox } from "@svp/components/src/vue/Checkbox";
import { Input } from "@svp/components/src/vue/Input";

export default defineComponent(() => {
  const args = ref(["editorconfig", "biome", "tsconfig", "prettier"]);

  return () => (
    <div>
      <form
        class="not-content my-8"
        onChange={(e) => {
          const data = new FormData(e.currentTarget as HTMLFormElement);
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

      <Input readonly value={`npx @svp/codestyle ${args.value.join(" ")}`} />
    </div>
  );
});

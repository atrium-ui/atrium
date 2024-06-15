/* @jsxImportSource vue */

import { defineComponent, ref } from "vue";
import { Checkbox } from "@components/src/vue/Checkbox";
import { Input } from "@components/src/vue/Input";

const args = ref(["editorconfig", "biome", "tsconfig", "prettier"]);

export default function () {
  return (
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

      <Input readonly value={`npx @sv/codestyle ${args.value.join(" ")}`} />
    </div>
  );
}

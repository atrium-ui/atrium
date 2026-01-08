/* @jsxImportSource vue */
import "@sv/elements/popover";
import { defineComponent, ref } from "vue";
import { Input } from "./Input.js";

export const Datepicker = defineComponent(
  (props: { onChange?: (value: CustomEvent<{ date: Date }>) => void }) => {
    const value = ref();

    return () => (
      <a-popover-trigger class="relative z-10">
        {/* @ts-ignore */}
        <div slot="trigger">
          <Input placeholder="Select a date" value={value.value} />
        </div>

        <a-popover class="group" placements="bottom">
          <div class="w-[max-content] p-3 opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100">
            <div class="min-w-[100px] scale-95 rounded-md bg-white p-1 shadow-lg transition-all duration-150 group-[&[enabled]]:scale-100">
              <a-calendar
                onChange={(ev) => {
                  value.value = ev.target.value;
                  requestAnimationFrame(() => {
                    ev.target.dispatchEvent(new CustomEvent("exit"));
                  });
                }}
              />
            </div>
          </div>
        </a-popover>
      </a-popover-trigger>
    );
  },
  {
    props: ["onChange"],
  },
);

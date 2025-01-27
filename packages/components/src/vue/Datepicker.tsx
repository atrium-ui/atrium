/* @jsxImportSource vue */
import "@atrium-ui/elements/popover";
import { Button } from "./Button";
import { defineComponent, ref } from "vue";
import AirDatepicker from "air-datepicker";
import "air-datepicker/air-datepicker.css";
import localeEn from "air-datepicker/locale/en";
import localeDe from "air-datepicker/locale/de";
import { Input } from "./Input";

const locales = {
  en: localeEn,
  de: localeDe,
};

// This is an example of how to integrate any date-picker into a web component.
class Calendar extends (globalThis.HTMLElement || class {}) {
  private air?: AirDatepicker<Calendar>;

  connectedCallback() {
    this.air?.destroy();
    this.air = new AirDatepicker(this, {
      inline: true,
      visible: true,
      locale: locales[document.documentElement.lang] || locales.en,
      onSelect: (date) => {
        this.dispatchEvent(new CustomEvent("change", { detail: date, bubbles: true }));
      },
    });
  }
}

customElements.define("a-calendar", Calendar);

export const Datepicker = defineComponent(
  (props: { onChange?: (value: CustomEvent<{ date: Date }>) => void }) => {
    const value = ref();

    return () => (
      <a-popover-trigger class="relative z-10">
        {/* @ts-ignore */}
        <div slot="trigger">
          <Input placeholder="Select a date" value={value.value} />
        </div>

        <a-popover class="group">
          <div class="w-[max-content] opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100">
            <div class="min-w-[100px] scale-95 rounded-md p-1 transition-all duration-150 group-[&[enabled]]:scale-100">
              <a-calendar
                onChange={(ev) => {
                  const date = ev.detail.date;
                  value.value = date.toLocaleDateString();
                  props.onChange?.(ev);
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

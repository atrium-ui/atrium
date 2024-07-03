/* @jsxImportSource vue */

import { sentence, lorem } from "txtgen";
import { defineComponent, ref } from "vue";
import { Checkbox } from "@components/src/vue/Checkbox";
import { Accordion, AccordionItem } from "@components/src/vue/Accordion";
import { Input } from "@components/src/vue/Input";
import { Combobox, ComboboxItem } from "@components/src/vue/Combobox";
import { Button } from "@components/src/vue/Button";
import { Icon } from "@components/src/vue/Icon";
import { Popover } from "@components/src/vue/Popover";
import { Dialog } from "@components/src/vue/Dialog";
import { Slider } from "@components/src/vue/Slider";
import "@sv/elements/adaptive";
import "@sv/elements/select";

export const Showcase = defineComponent(() => {
  const options = ref<string[]>(["Item 1", "Item 2", "Item 3"]);

  const search = ref<string>("");
  const filter = ref<string[]>([]);

  const data = new Array(10).fill(1).map((_, i) => {
    return {
      type: options.value[Math.floor(Math.random() * options.value.length)],
      highlight: Math.random() > 0.5,
      title: sentence(),
    };
  });

  const data2 = [
    {
      title: sentence().split(" ").slice(0, 6).join(" "),
      text: lorem(10, 30),
    },
    {
      title: sentence().split(" ").slice(0, 6).join(" "),
      text: lorem(10, 30),
    },
    {
      title: sentence().split(" ").slice(0, 6).join(" "),
      text: lorem(10, 30),
    },
    {
      title: sentence().split(" ").slice(0, 6).join(" "),
      text: lorem(10, 30),
    },
  ];

  return () => (
    <div class="p-8 text-white">
      <div class="grid gap-10 pb-10 lg:grid-cols-[1fr_400px]">
        <div>
          <div class="flex gap-4 pb-3">
            <Input
              value={search.value}
              onInput={(e) => {
                search.value = e.target?.value;
              }}
              class="w-full"
              placeholder="Search..."
            />
            <Combobox
              onChange={(arr) => {
                filter.value = [...arr];
              }}
              value={filter.value}
            >
              {options.value.map((opt, i) => {
                return (
                  <ComboboxItem
                    key={i}
                    value={opt}
                    selected={filter.value.includes(opt)}
                  />
                );
              })}
            </Combobox>
            <Dialog label="Submit">This doesn't actually do anything.</Dialog>
          </div>
          <div class="inline-flex justify-between overflow-hidden rounded-md border border-zinc-700 p-1">
            <a-adaptive>
              <div class="flex gap-1">
                {filter.value.length > 0 ? (
                  filter.value.map((str, i) => {
                    return (
                      <div key={i} class="flex-none rounded border border-zinc-800 px-2">
                        <span>{str}</span>
                        <button
                          type="button"
                          class="cursor-pointer bg-transparent p-0 px-2"
                          onClick={() => {
                            const tmp = [...filter.value];
                            tmp.splice(i, 1);
                            filter.value = tmp;
                          }}
                        >
                          X
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div class="flex-none rounded-lg border border-transparent px-2">
                    No Filter
                  </div>
                )}
              </div>
            </a-adaptive>

            <button
              type="button"
              class="cursor-pointer bg-transparent px-3"
              onClick={() => {
                filter.value = [];
              }}
            >
              X
            </button>
          </div>
        </div>

        <div class="flex items-start justify-end">
          <Popover>
            {{
              input: () => (
                <Button slot="input" variant="outline" class="rounded-[100%] p-3">
                  <Icon name="atrium" />
                </Button>
              ),
              default: () => (
                <div class="flex flex-col gap-1">
                  <Button variant="ghost" class="w-[200px] gap-4">
                    <Icon name="arrow-right" />
                    <span>Profile</span>
                  </Button>
                  <Button variant="ghost" class="w-[200px] gap-4">
                    <Icon name="close" />
                    <span>Settings</span>
                  </Button>
                  <hr class="my-1 h-[1px] w-full bg-zinc-700" />
                  <div class="px-2">
                    <Checkbox id="darkmode">
                      <span class="text-base">Darkmode</span>
                    </Checkbox>
                  </div>
                </div>
              ),
            }}
          </Popover>
        </div>
      </div>

      <div class="grid gap-10 overflow-hidden lg:grid-cols-[1fr_400px]">
        <Slider>
          {data
            .filter((item) => {
              const matchTitle =
                search.value.length === 0 ||
                item.title.toLowerCase().includes(search.value.toLowerCase());
              const matchType =
                filter.value.length === 0 ||
                filter.value
                  .map((str) => str.toLowerCase())
                  .includes(item.type.toLowerCase());

              return matchTitle && matchType;
            })
            .map((data, i) => {
              return (
                <div key={i} class="pr-2">
                  <div class="h-[300px] w-[200px] flex-none overflow-hidden rounded bg-zinc-700 p-2 text-justify font-bold text-[#1c1c1c] text-xl uppercase">
                    {data.title}
                  </div>
                </div>
              );
            })}
        </Slider>

        <Accordion class="min-h-[400px]">
          {data2.map((data, i) => {
            return (
              <AccordionItem key={i} title={data.title}>
                {data.text}
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
});

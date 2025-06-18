/* @jsxImportSource vue */

import { Accordion, AccordionItem } from "@components/src/vue/Accordion";
import { lorem, sentence } from "txtgen";
import { Card } from "../Card";

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

export function AccordionCard() {
  return (
    <Card class="p-3">
      <div class="flex flex-col space-y-1.5 pb-8">
        <h3 class="whitespace-nowrap font-semibold text-2xl leading-none tracking-tight">
          FAQ
        </h3>
        <p class="text-muted-foreground text-sm">Frequently Asked Questions</p>
      </div>

      <Accordion>
        {data2.map((data, i) => {
          return (
            <AccordionItem key={i} title={data.title}>
              {data.text}
            </AccordionItem>
          );
        })}
      </Accordion>
    </Card>
  );
}

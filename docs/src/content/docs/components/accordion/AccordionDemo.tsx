/* @jsxImportSource vue */
import { Accordion, AccordionItem } from "@components/src/vue/Accordion";

export function AccordionDemo() {
  return (
    <Accordion>
      <AccordionItem title="Item 1">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
        tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
        no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </AccordionItem>
      <AccordionItem title="Item 2">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
        tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
        no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </AccordionItem>
    </Accordion>
  );
}

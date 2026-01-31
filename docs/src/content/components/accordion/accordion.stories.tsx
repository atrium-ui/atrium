/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Accordion, AccordionItem } from "@components/src/vue";

export default {
  tags: ["public"],
  args: {},
  argTypes: {
    count: {
      description: "Number of slides",
    },
  },
};

export const Default: Story = {
  render: (args) => {
    return (
      <Accordion>
        <AccordionItem title="Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt">
          <p class="max-w-[50rem]">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
            eirmod tempor{" "}
            <a class="underline" id="test" href="/">
              invidunt
            </a>{" "}
            ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
            takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </AccordionItem>
        <AccordionItem title="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut">
          <p class="max-w-[50rem]">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
            eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
            voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
            kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </AccordionItem>
        <AccordionItem title="Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt">
          <p class="max-w-[50rem]">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
            eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
            voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
            kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </AccordionItem>
      </Accordion>
    );
  },
};

export const Opened: Story = {
  render: (args) => {
    return (
      <Accordion>
        <AccordionItem
          opened
          title="Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt"
        >
          <p class="max-w-[50rem]">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
            eirmod tempor{" "}
            <a class="underline" id="test" href="/">
              invidunt
            </a>{" "}
            ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
            takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </AccordionItem>
        <AccordionItem title="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut">
          <p class="max-w-[50rem]">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
            eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
            voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
            kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </AccordionItem>
        <AccordionItem title="Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt">
          <p class="max-w-[50rem]">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
            eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
            voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
            kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </AccordionItem>
      </Accordion>
    );
  },
};

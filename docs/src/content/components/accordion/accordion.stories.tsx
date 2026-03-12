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

export const LandingPage: Story = {
  render: () => {
    return (
      <div class="h-full p-4">
        <Accordion>
          <AccordionItem
            opened
            class="block border border-zinc-200 bg-white"
            title="Shipping options"
          >
            <p class="text-sm text-zinc-600">
              Express delivery in 2 days, studio pickup tomorrow, or standard shipping
              within the week.
            </p>
          </AccordionItem>
          <AccordionItem class="block border border-zinc-200 bg-white" title="Materials">
            <p class="text-sm text-zinc-600">
              Oak veneer, powder-coated steel, and machine-washable textile covers.
            </p>
          </AccordionItem>
          <AccordionItem class="block border border-zinc-200 bg-white" title="Care">
            <p class="text-sm text-zinc-600">
              Wipe surfaces dry and avoid direct sunlight for prolonged periods.
            </p>
          </AccordionItem>
        </Accordion>
      </div>
    );
  },
};

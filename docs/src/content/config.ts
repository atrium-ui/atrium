import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection } from "astro:content";

export const collections = {
  components: defineCollection({
    schema: docsSchema(),
  }),
  elements: defineCollection({
    schema: docsSchema(),
  }),
  packages: defineCollection({
    schema: docsSchema(),
  }),
  docs: defineCollection({
    schema: docsSchema(),
  }),
};

import { defineCollection, z } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    schema: docsSchema({
      extend: z.object({
        // Add a new field to the schema.
        fullscreen: z.boolean().optional(),
        stage: z
          .object({
            headline: z.string().optional(),
            subline: z.string().optional(),
          })
          .optional(),
      }),
    }),
  }),
};

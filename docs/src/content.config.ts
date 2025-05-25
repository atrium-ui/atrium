import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content" }),
    schema: z.object({
      title: z.string().optional(),
      group: z.string().optional(),
      icon: z.string().optional(),
      template: z.string().optional(),
      fullscreen: z.boolean().optional(),
      stage: z
        .object({
          headline: z.string().optional(),
          subline: z.string().optional(),
        })
        .optional(),
    }),
  }),
};

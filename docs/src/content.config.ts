import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content" }),
    schema: z.object({
      title: z.string().optional(),
      headline: z.string().optional(),
      description: z.string().optional(),
      command: z.string().optional(),
      tags: z.string().array().array().optional(),
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

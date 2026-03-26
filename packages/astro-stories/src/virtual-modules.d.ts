declare module "virtual:astro-stories/config" {
  export const inlineStyles: string;
  export const imports: string[];
  export const route: string;
}

declare module "virtual:astro-stories/lazy" {
  import type { StoryModuleLoader } from "./story";

  export const stories: Map<string, StoryModuleLoader>;
}

declare module "virtual:astro-stories/setup";

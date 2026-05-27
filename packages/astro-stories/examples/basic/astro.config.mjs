import react from "@astrojs/react";
import { astroStories } from "@sv/astro-stories";
import { defineConfig } from "astro/config";

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    astroStories({
      route: "/story",
      stories: ["/src/**/*.stories.*"],
    }),
    react(),
  ],
});

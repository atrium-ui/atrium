import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  // Get the content collection entry for this page.
  const { entry } = context.locals.starlightRoute;
  // Update the title to add an exclamation mark.
  entry.data.title = entry.data.title + "!";
});

import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  // filter sidebar entries by the current slug

  const slug = context.locals.starlightRoute.slug.split("/")[0];

  const sidebar = context.locals.starlightRoute.sidebar;
  const subSidebar = sidebar.find((item) => item.label === slug);

  context.locals.starlightRoute.sidebar = subSidebar?.entries || [];
});

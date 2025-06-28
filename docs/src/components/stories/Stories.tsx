/* @jsxImportSource solid-js */

import { render } from "lit";
import { createEffect, createSignal } from "solid-js";

const storiesImports = import.meta.glob("/src/**/*.stories.*");

type Story = unknown;
const stories = new Map<string, () => Promise<Story>>();

for (const key in storiesImports) {
  const storyId = key.split("/").pop()?.replace(".stories.ts", "").toLowerCase();
  if (storyId) {
    stories.set(storyId, storiesImports[key]);
  }
}

const [story, setStory] = createSignal();
const [variant, setVariant] = createSignal();
const [layout, setLayout] = createSignal("default");
const [globals, setGlobals] = createSignal({});

export function Stories() {
  const searchParams = new URLSearchParams(location.search);
  const currentStoryId = searchParams.get("id");
  if (currentStoryId) {
    const id = currentStoryId.split("--")[0];
    const variant = currentStoryId.split("--")[1];

    stories
      .get(id)?.()
      .then((storyModule) => {
        const module = storyModule as Record<string, Promise<Story>>;
        setStory(module.default);

        for (const key in module) {
          if (key.toLowerCase() === variant) {
            const variantStory = module[key];
            setVariant(variantStory);
            break;
          }
        }
      });
  }

  const root = document.createElement("div");

  createEffect(() => {
    const storyDefinition = story();
    if (!storyDefinition) {
      return;
    }

    const args = storyDefinition.args;
    const parameters = storyDefinition.parameters || {};
    const globals = storyDefinition.globals || {};

    const vars = variant();

    if (vars) {
      Object.assign(args, vars.args);
      Object.assign(parameters, vars.parameters);
      Object.assign(globals, vars.globals);
      Object.assign(storyDefinition, vars);
    }

    const { render: renderStory } = storyDefinition;

    // merge args with args from search params
    for (const param of searchParams.entries()) {
      args[param[0]] = param[1];
    }

    setGlobals(globals || {});
    setLayout(parameters?.layout || "default");

    // framework specific
    render(renderStory(args), root);

    window.dispatchEvent(new Event("story.loaded"));
  });

  return (
    <div
      class={[
        `story-root overflow-hidden story-layout-${layout()}`,
        globals().theme ? `fra-context-background fra-context-${globals().theme}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {root}
    </div>
  );
}

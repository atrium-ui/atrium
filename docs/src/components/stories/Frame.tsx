import { render } from "lit";
import { stories } from "./stories.js";
import { useState, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

export function Frame() {
  const [story, setStory] = useState();
  const [variant, setVariant] = useState();
  const [layout, setLayout] = useState("default");
  const [globals, setGlobals] = useState({});

  const searchParams = new URLSearchParams(location.search);
  const currentStoryId = searchParams.get("id");
  if (currentStoryId) {
    const id = currentStoryId.split("--")[0];
    const variant = currentStoryId.split("--")[1];

    stories
      .get(id)?.()
      .then((module) => {
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

  useEffect(() => {
    const storyDefinition = story;
    if (!storyDefinition) {
      return;
    }

    const args = storyDefinition.args;
    const parameters = storyDefinition.parameters || {};
    const globals = storyDefinition.globals || {};

    const vars = variant;

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
  }, [story, variant]);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.appendChild(root);
  }, [root]);

  return (
    <div>
      <div
        className={twMerge(
          `story-root overflow-hidden story-layout-${layout}`,
          globals.theme ? `fra-context-background fra-context-${globals.theme}` : "",
        )}
        ref={rootRef}
      />
    </div>
  );
}

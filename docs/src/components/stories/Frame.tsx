import { render as renderLit } from "lit";
import { render as renderVue } from "vue";
import { createRoot, type Root as ReactRoot } from "react-dom/client";
import { stories, type Story } from "./stories.js";
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { twMerge } from "tailwind-merge";

export function Frame() {
  const [story, setStory] = useState<Story | null | undefined>();
  const [variant, setVariant] = useState();
  const [layout, setLayout] = useState("default");
  const [globals, setGlobals] = useState({});

  const [reactRoot, setReactRoot] = useState<ReactRoot>();

  const rootRef = useRef<HTMLDivElement>(null);

  const searchParams = new URLSearchParams(location.search);
  const currentStoryId = searchParams.get("id");
  if (currentStoryId) {
    const id = currentStoryId.split("--")[0];
    const variant = currentStoryId.split("--")[1];

    const storyModule = stories.get(id);

    if (!storyModule) {
      setStory(null);
    } else {
      storyModule()?.then((module) => {
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
  }

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

    if (!rootRef.current) return;

    if (renderStory instanceof Function) {
      const template = renderStory(args);

      // framework specific
      if (template.$$typeof) {
        // react
        if (!reactRoot) {
          setReactRoot(createRoot(rootRef.current));
        }
        reactRoot?.render(template);
      } else if (template.__v_isVNode) {
        // vue
        renderVue(template, rootRef.current);
      } else {
        // lit (default)
        renderLit(template, rootRef.current);
      }
    } else {
      console.warn("No render function found on story", currentStoryId);
    }

    window.dispatchEvent(new Event("story.loaded"));
  }, [story, variant, currentStoryId, reactRoot]);

  return (
    <div>
      <div
        className={twMerge(
          `story-root overflow-hidden story-layout-${layout}`,
          globals.theme ? `fra-context-background fra-context-${globals.theme}` : "",
        )}
        ref={rootRef}
      >
        {!story ? (
          <div className="flex h-fill w-full flex-col items-center justify-center text-red-500 opacity-50">
            Story not found "{currentStoryId}"
          </div>
        ) : null}
      </div>
    </div>
  );
}

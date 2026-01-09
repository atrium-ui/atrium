import { render as renderLit } from "lit";
import { render as renderVue } from "vue";
import { createRoot, type Root as ReactRoot } from "react-dom/client";
import { stories, type Story } from "./stories.js";
import { useState, useEffect, useRef, useMemo } from "react";
import { twMerge } from "tailwind-merge";

export function StoryFrame() {
  const searchParams = useMemo(() => new URLSearchParams(location.search), []);
  const currentStoryId = searchParams?.get("id");

  const [story, setStory] = useState<Story | null | undefined>();
  const [variant, setVariant] = useState<Story>();
  const [renderer, setRenderer] = useState<string>();
  const [layout, setLayout] = useState("default");
  const [globals, setGlobals] = useState<Story["globals"]>({});

  const [reactRoot, setReactRoot] = useState<ReactRoot>();

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
            if (key.toLowerCase() === variant?.toLowerCase()) {
              setVariant(module[key]);
              break;
            }
          }
        });
      }
    }
  }, [currentStoryId]);

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

    setGlobals(globals);
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
        setRenderer("react");
      } else if (template.__v_isVNode) {
        // vue
        renderVue(template, rootRef.current);
        setRenderer("vue");
      } else {
        // lit (default)
        renderLit(template, rootRef.current);
        setRenderer("lit");
      }
    } else {
      console.warn("No render function found on story", currentStoryId);
    }

    window.dispatchEvent(new Event("story.loaded"));
  }, [story, variant, currentStoryId, reactRoot, searchParams]);

  return (
    <div data-story-renderer={renderer}>
      <div
        className={twMerge(
          `story-root overflow-hidden p-0 story-layout-${layout}`,
          globals.theme ? `fra-context-background fra-context-${globals.theme}` : "",
        )}
        ref={rootRef}
      >
        {!story ? (
          <pre className="flex h-fill w-full flex-col items-center justify-center text-red-500 opacity-50">
            Story not found "{currentStoryId}"
          </pre>
        ) : null}
      </div>
    </div>
  );
}

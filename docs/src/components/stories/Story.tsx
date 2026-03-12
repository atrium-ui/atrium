import { render as renderLit } from "lit";
import { createApp, type App as VueApp } from "vue";
import { createRoot, type Root as ReactRoot } from "react-dom/client";
import { stories, type Story } from "./stories.js";
import { useState, useEffect, useRef, useMemo } from "react";
import { twMerge } from "tailwind-merge";

export function StoryFrame() {
  const searchParams = useMemo(() => new URLSearchParams(location.search), []);
  const currentStoryId = searchParams?.get("id");
  const fill = searchParams?.has("fill");

  const [story, setStory] = useState<Story | null | undefined>();
  const [variant, setVariant] = useState<Story>();
  const [renderer, setRenderer] = useState<string>();
  const [layout, setLayout] = useState("default");
  const [globals, setGlobals] = useState<Story["globals"]>({});
  const [loaded, setLoaded] = useState(false);

  const [reactRoot, setReactRoot] = useState<ReactRoot>();
  const vueApp = useRef<VueApp | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const isLoading = story === undefined && Boolean(currentStoryId);

  useEffect(() => {
    setLoaded(false);

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

    const args = storyDefinition.args ?? {};
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
      } else if (template.__v_isVNode || typeof template === "function") {
        // vue — if render returned a function, treat it as setup() returning a render fn
        vueApp.current?.unmount();
        vueApp.current = createApp(
          typeof template === "function"
            ? { setup: () => template }
            : { render: () => template },
        );
        vueApp.current.mount(rootRef.current);
        setRenderer("vue");
      } else {
        // lit (default)
        renderLit(template, rootRef.current);
        setRenderer("lit");
      }
    } else {
      console.warn("No render function found on story", currentStoryId);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLoaded(true);
        window.dispatchEvent(new Event("story.loaded"));
      });
    });
  }, [story, variant, currentStoryId, reactRoot, searchParams]);

  return (
    <div
      data-story-renderer={renderer}
      className={twMerge(fill ? "h-full" : "min-h-64", "relative")}
    >
      <div
        className={twMerge(
          `story-root ${fill ? "h-full" : "min-h-64"} overflow-hidden p-0 story-layout-${layout} transition-opacity duration-300`,
          loaded ? "opacity-100" : "opacity-0",
          globals.theme ? `fra-context-background fra-context-${globals.theme}` : "",
        )}
        ref={rootRef}
      >
        {story === null && currentStoryId ? (
          <pre className="flex h-fill w-full flex-col items-center justify-center text-red-500 opacity-50">
            Story not found "{currentStoryId}"
          </pre>
        ) : null}
      </div>

      <div
        className={twMerge(
          "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          isLoading ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className={twMerge(
            "h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 transition-opacity duration-200",
            isLoading ? "opacity-100" : "opacity-0",
          )}
          aria-label="Loading story"
        />
      </div>
    </div>
  );
}

import {
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { render as renderLit } from "lit";
import { createApp, isVNode, type App as VueApp } from "vue";
import { createRoot, type Root as ReactRoot } from "react-dom/client";
import { stories } from "virtual:astro-stories/lazy";
import type { StoryModule } from "../story";
import { resolveStory } from "./story-helpers";
import "./styles.css";

function resetTarget(
  target: HTMLDivElement,
  reactRootRef: MutableRefObject<ReactRoot | null>,
  vueAppRef: MutableRefObject<VueApp<Element> | null>,
) {
  reactRootRef.current?.unmount();
  reactRootRef.current = null;
  vueAppRef.current?.unmount();
  vueAppRef.current = null;
  target.replaceChildren();
}

export function StoryFrame() {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const identifier = searchParams.get("id");
  const [storyModule, setStoryModule] = useState<StoryModule | null>();
  const [error, setError] = useState<string>();
  const [loaded, setLoaded] = useState(false);

  const reactRootRef = useRef<ReactRoot | null>(null);
  const vueAppRef = useRef<VueApp<Element> | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setError(undefined);
    setLoaded(false);

    if (!identifier) {
      throw new Error("StoryFrame requires an id query parameter");
    }

    const storyId = identifier.split("--")[0];
    if (!storyId) {
      throw new Error(`Invalid story identifier "${identifier}"`);
    }

    const loader = stories.get(storyId);
    if (!loader) {
      setStoryModule(null);
      return;
    }

    let cancelled = false;
    loader()
      .then((module) => {
        if (!cancelled) {
          setStoryModule(module);
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [identifier]);

  useEffect(() => {
    if (storyModule === undefined) {
      return;
    }

    const target = targetRef.current;
    if (!target) {
      throw new Error("StoryFrame target is missing");
    }

    const resolvedStory = resolveStory(storyModule, identifier, searchParams);
    if (!resolvedStory) {
      return;
    }

    if (resolvedStory.error) {
      setError(resolvedStory.error);
      return;
    }

    const story = resolvedStory.story;
    if (!story?.render) {
      setError(`Story "${identifier}" does not export a render function`);
      return;
    }

    resetTarget(target, reactRootRef, vueAppRef);

    try {
      const rendered = story.render(story.args ?? {});
      setError(undefined);

      if (isValidElement(rendered)) {
        reactRootRef.current = createRoot(target);
        reactRootRef.current.render(rendered);
      } else if (typeof rendered === "function") {
        vueAppRef.current = createApp({ setup: () => rendered });
        vueAppRef.current.mount(target);
      } else if (isVNode(rendered)) {
        vueAppRef.current = createApp({ render: () => rendered });
        vueAppRef.current.mount(target);
      } else {
        renderLit(rendered, target);
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLoaded(true);
        });
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }

    return () => {
      if (targetRef.current) {
        resetTarget(targetRef.current, reactRootRef, vueAppRef);
      }
    };
  }, [identifier, searchParams, storyModule]);

  return (
    <div className={`astro-stories-root${loaded ? " astro-stories-root-loaded" : ""}`}>
      <div className="astro-stories-frame-target" ref={targetRef} />
      {error ? <pre className="astro-stories-error">{error}</pre> : null}
    </div>
  );
}

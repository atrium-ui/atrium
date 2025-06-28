import {
  type ParentProps,
  type Signal,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js";
import { Controls } from "./Controls";
import "./Preview.css";
import { stories, type StoryIndex } from "./stories";

const base = import.meta.env.BASE_URL;

function OpenStoryButton(props: { query: string }) {
  return (
    <a
      title="Open in new tab"
      href={`${base}story?${props.query}`}
      class="block rounded-md p-2 opacity-50 hover:bg-gray-100 hover:opacity-100"
      target="_blank"
      rel="noreferrer"
    >
      <span class="sr-only">Open in new tab</span>
      <svg
        class="block"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        fill="#000000"
        viewBox="0 0 256 256"
      >
        <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
      </svg>
    </a>
  );
}

function StoryFrame(props: { canvasId: string; params?: string }) {
  const iframe = document.createElement("iframe");

  createEffect(() => {
    iframe.title = `Story of ${props.canvasId}`;
    iframe.src = `${base}story?id=${props.canvasId}&${props.params || ""}`;
  });

  window?.addEventListener("message", (msg) => {
    if (props.canvasId === msg.data.id) {
      iframe.style.height = `${msg.data.height}px`;
      window.dispatchEvent(new Event("story.loaded"));
    }
  });

  return iframe;
}

export function Preview(props: ParentProps) {
  const [storyId, setStoryId] = createSignal<string>();
  const [storyData, setStoryData] = createSignal<StoryIndex>();
  const storyUserArgs = new Map<string, Signal<Record<string, any>>>();

  const [id, setId] = createSignal<string>("");
  const [variantId, setVariantId] = createSignal<string>();

  const location = globalThis.location || {};

  const of = "fraport";

  const [userArgs, setUserArgs] = createSignal<Record<string, any>>({});

  storyUserArgs.set(of, [userArgs, setUserArgs]);

  const searchParams = createMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const argsData = {
      ...storyData()?.[of]?.args,
      ...userArgs(),
    };
    for (const key in argsData) {
      const value = argsData[key];
      searchParams.set(key, value.toString());
    }
    return searchParams.toString();
  });

  onMount(async () => {
    const previewId = new URLSearchParams(location.search).get("id");
    setId(previewId || "");

    setVariantId(previewId?.split("--")[1]);
    setStoryId(previewId?.split("--")[0] || "");

    const storyModule = await stories.get(storyId())?.();
    setStoryData(storyModule);
  });

  return (
    <div>
      {variantId() ? (
        <div class="docs-story-preview">
          <div class="docs-story-toolbar-container">
            <div class="docs-story-toolbar">
              <div>{id()}</div>
              <div>
                <OpenStoryButton query={`id=${id()}`} />
              </div>
            </div>
          </div>

          <StoryFrame canvasId={id()} params={searchParams()} />

          <div class="docs-story-controls-container">
            <Controls
              storyData={storyData()}
              storyUserArgs={storyUserArgs}
              variantId={variantId()}
            />
          </div>
        </div>
      ) : (
        props.children
      )}
    </div>
  );
}

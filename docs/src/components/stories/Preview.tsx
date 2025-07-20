import { useEffect, useMemo, useRef, useState } from "react";
import { Controls } from "./Controls.js";
import "./Preview.css";
import { stories, type StoryIndex } from "./stories.js";
import { twMerge } from "tailwind-merge";

const base = import.meta.env.BASE_URL;

function OpenStoryButton(props: { query: string }) {
  return (
    <a
      title="Open in new tab"
      href={`${base}story?${props.query}`}
      className="block rounded-md p-2 opacity-50 hover:bg-gray-100 hover:opacity-100"
      target="_blank"
      rel="noreferrer"
    >
      <span className="sr-only">Open in new tab</span>
      <svg
        className="block"
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

export function StoryCanvas(props: { id: string; params: string }) {
  const iframe = useMemo(() => document.createElement("iframe"), []);

  useEffect(() => {
    iframe.title = `Story of ${props.id}`;
    iframe.src = `${base}story?id=${props.id}&${props.params || ""}`;
  }, [props.id, props.params, iframe]);

  useEffect(() => {
    window?.addEventListener("message", (msg) => {
      if (props.id === msg.data.id) {
        iframe.style.height = `${msg.data.height}px`;
        window.dispatchEvent(new Event("story.loaded"));
      }
    });
  }, []);

  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iframe || !frameRef.current) return;
    frameRef.current.appendChild(iframe);
    iframe.style.height = "100%";
    iframe.style.width = "100%";
  }, [iframe]);

  return <div ref={frameRef} className="contents" />;
}

export function Preview() {
  const [storyId, setStoryId] = useState<string>();
  const [storyData, setStoryData] = useState<StoryIndex>();
  const storyUserArgs = new Map<string, Record<string, any>>();

  const [id, setId] = useState<string>("");
  const [variantId, setVariantId] = useState<string>();

  const location = globalThis.location || {};

  const of = "fraport";

  const [userArgs, setUserArgs] = useState<Record<string, any>>({});

  storyUserArgs.set(of, [userArgs, setUserArgs]);

  const searchParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const argsData = {
      ...storyData?.[of]?.args,
      ...userArgs,
    };
    for (const key in argsData) {
      const value = argsData[key];
      searchParams.set(key, value.toString());
    }
    return searchParams.toString();
  }, [storyData, userArgs, location.search]);

  useEffect(() => {
    const previewId = new URLSearchParams(location.search).get("id");
    setId(previewId || "");

    setVariantId(previewId?.split("--")[1]);
    setStoryId(previewId?.split("--")[0] || "");

    stories
      .get(storyId)?.()
      ?.then((storyModule) => {
        setStoryData(storyModule);
      });
  }, [storyId, location.search]);

  return (
    <a-blur
      scrolllock
      onExit={() => setVariantId("")}
      enabled={variantId}
      className={twMerge(
        "fixed top-0 right-0 bottom-0 left-0 z-10 h-full w-full bg-black/10 backdrop-blur-sm",
        "hidden items-center justify-center [&[enabled]]:flex",
      )}
    >
      <div className="pointer-events-auto relative min-h-[90vh] min-w-[90vw] rounded-lg bg-white shadow-2xl">
        <div className="docs-story-preview absolute! inset-0 h-full w-full">
          <div className="docs-story-toolbar-container">
            <div className="docs-story-toolbar">
              <div>{id}</div>
              <div className="flex gap-module-m">
                <OpenStoryButton query={`id=${id}`} />
                <button type="button" onClick={() => setVariantId("")}>
                  X
                </button>
              </div>
            </div>
          </div>

          <StoryCanvas id={id} params={searchParams} />

          <div className="docs-story-controls-container">
            <Controls
              storyData={storyData}
              storyUserArgs={storyUserArgs}
              variantId={variantId}
            />
          </div>
        </div>
      </div>
    </a-blur>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Controls } from "./Controls.js";
import "./Preview.css";
import { stories, type StoryIndex } from "./stories.js";
import { twMerge } from "tailwind-merge";
import { elementToSVG } from "dom-to-svg";
import * as prettier from "prettier";
import * as prettierHTML from "prettier/parser-html";

function copySVG(target: HTMLElement) {
  const svgDocument = elementToSVG(target);
  return new XMLSerializer().serializeToString(svgDocument);
}

const base = import.meta.env.BASE_URL;

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

  return (
    <div className="relative min-h-40">
      <div className="absolute bottom-0 left-full">
        <div className="flex flex-col gap-module-xl px-6 py-2">
          <a
            className="button-icon"
            href={`${base}story?${`id=${props.id}`}`}
            title="Open example in new tab"
            target="_blank"
            rel="noreferrer"
          >
            <svg-icon className="block" use="external" />
          </a>

          <button
            type="button"
            className="button-icon"
            title="Copy component as SVG"
            onClick={(e) => {
              const ele = iframe.contentDocument?.querySelector(".story-root");
              if (!ele) return;

              const str = copySVG(ele);

              navigator.clipboard
                .write([new ClipboardItem({ "text/plain": str || "" })])
                .then(() => {
                  showToast("Copied to clipboard");
                });
            }}
          >
            <svg-icon className="block" use="svg" />
          </button>

          <button
            type="button"
            className="button-icon"
            title="Copy component as HTML"
            onClick={async (e) => {
              const ele = iframe.contentDocument?.querySelector(".story-root");
              if (!ele) return;

              const text = await prettier.format(ele.innerHTML, {
                parser: "html",
                plugins: [prettierHTML],
              });

              navigator.clipboard
                .write([new ClipboardItem({ "text/plain": text || "" })])
                .then(() => {
                  showToast("Copied to clipboard");
                });
            }}
          >
            <svg-icon className="block" use="code" />
          </button>
        </div>
      </div>

      <div ref={frameRef} className="contents" />
    </div>
  );
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
                <a
                  title="Open in new tab"
                  href={`${base}story?${`id=${id}`}`}
                  className="block rounded-md p-2 opacity-50 hover:bg-gray-100 hover:opacity-100"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">Open in new tab</span>
                  <svg-icon use="external" class="block" />
                </a>

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

/* @jsxImportSource solid-js */

import "./Preview.css";
import { type ParentProps, createSignal, onMount } from "solid-js";
import { Controls, Meta, OpenStoryButton, StoryFrame } from "./Docs";

export function Preview(props: ParentProps) {
  const [id, setId] = createSignal<string>("");
  const [variantId, setVariantId] = createSignal<string>();

  onMount(() => {
    const previewId = new URLSearchParams(location.search).get("id");
    setId(previewId || "");
    setVariantId(previewId?.split("--")[1]);
  });

  return (
    <div>
      {variantId() ? (
        <div class="docs-story-preview">
          <div class="docs-story-toolbar-container">
            <div class="docs-story-toolbar">
              <div>
                <button type="button" onClick={() => console.log("TODO: implement")}>
                  X
                </button>
              </div>
              <div>
                <OpenStoryButton query={`id=${id()}`} />
              </div>
            </div>
          </div>

          <StoryFrame canvasId={id()} />

          <div class="docs-story-controls-container">
            <Controls of={variantId()} />
          </div>
        </div>
      ) : (
        props.children
      )}
    </div>
  );
}

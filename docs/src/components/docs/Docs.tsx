/* @jsxImportSource solid-js */

import "./Docs.css";
import { type Signal, createEffect, createMemo, createSignal } from "solid-js";

type ArgType = any;
type ParamType = any;

type Story<Template = unknown> = {
  tags: string[];
  parameters: Record<string, Record<string, ParamType>>;
  args: Record<string, string | number>;
  argTypes: Record<string, Record<string, ArgType>>;
  render: () => Template;
};

type StoryIndex = {
  [key: string]: Story;
} & {
  _id: string;
};

const [storyId, setStoryId] = createSignal<string>();
const [storyData, setStoryData] = createSignal<StoryIndex>();
const storyUserArgs = new Map<string, Signal<Record<string, any>>>();

export function Meta(props: {
  of: StoryIndex;
}) {
  setStoryId(props.of._id);
  setStoryData(props.of);

  return <div />;
}

// Canvas

export function OpenStoryButton(props: { query: string }) {
  return (
    <a
      title="Open in new tab"
      href={`/atrium/story?${props.query}`}
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

export function Canvas(props: { of: string }) {
  if (typeof window === "undefined") return <div />;

  const [userArgs, setUserArgs] = createSignal<Record<string, any>>({});

  storyUserArgs.set(props.of, [userArgs, setUserArgs]);

  const searchParams = createMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const argsData = {
      ...storyData()?.[props.of]?.args,
      ...userArgs(),
    };
    for (const key in argsData) {
      const value = argsData[key];
      searchParams.set(key, value.toString());
    }
    return searchParams.toString();
  });

  const canvasId = createMemo(() => {
    return `${storyId()}--${props.of}`.toLowerCase();
  });

  return (
    <div class="not-content docs-story-canvas" data-story={canvasId()}>
      <div class="absolute top-1 right-1 z-[1]">
        <OpenStoryButton query={`id=${canvasId()}&${searchParams()}`} />
      </div>

      <StoryFrame canvasId={canvasId()} params={searchParams()} />
    </div>
  );
}

export function StoryFrame(props: { canvasId: string; params?: string }) {
  const iframe = document.createElement("iframe");

  createEffect(() => {
    iframe.title = `Story of ${storyId()}`;
    iframe.src = `/atrium/story?id=${props.canvasId}&${props.params || ""}`;
  });

  window?.addEventListener("message", (msg) => {
    if (props.canvasId === msg.data.id) {
      iframe.style.height = `${msg.data.height}px`;
      window.dispatchEvent(new Event("story.loaded"));
    }
  });

  return iframe;
}

// Controls

type Args = {
  name: string;
  description: string | undefined;
  value: string | number | boolean | undefined;
  type: string;
  options: string[];
};

export function Controls(props: { of: string }) {
  const args = createMemo(() => {
    const values = storyData()?.default.args;
    const types = storyData()?.default.argTypes;

    const allArgs: Args[] = [];

    const keys = Object.keys({
      ...types,
      ...values,
    });

    for (const key of keys) {
      const type = types?.[key];
      const value = values?.[key];

      allArgs.push({
        name: key,
        description: type?.description,
        value: value,
        type: type?.control?.type || typeof value || "string",
        options: type?.options,
      });
    }

    return allArgs;
  });

  function applyArgs(controls: FormData, variantId: string) {
    const argsSignal = storyUserArgs.get(variantId);
    if (!argsSignal) return;

    const [userArgs, setUserArgs] = argsSignal;

    // values not in the form data are retained, even if changed to "false"
    const args = {
      ...userArgs(),
    };
    for (const [key, value] of controls.entries()) {
      args[key] = value;
    }
    setUserArgs(args);
  }

  return (
    <form
      class="docs-story-controls"
      onChange={(e) => applyArgs(new FormData(e.currentTarget), props.of)}
    >
      <table class="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {args().map((arg, i) => {
            return (
              <tr key={`row-${i}`}>
                <td>
                  <code>{arg.name}</code>
                </td>
                <td>
                  {arg.description ? (
                    <span>
                      {arg.description}
                      <br />
                    </span>
                  ) : (
                    ""
                  )}
                  <code>{arg.type}</code>
                </td>
                <td>{renderControl(arg)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </form>
  );
}

function renderControl(arg: Args) {
  if (arg.type === "boolean") {
    return <input name={arg.name} type="checkbox" checked={!!arg.value || undefined} />;
  }
  if (arg.type === "number") {
    return <input name={arg.name} type="number" value={arg.value as number} />;
  }
  if (arg.type === "select") {
    return (
      <select class="w-full" name={arg.name} value={(arg.value as string) || undefined}>
        {arg.options?.map((option, i) => (
          <option key={`option-${i}`}>{option}</option>
        ))}
      </select>
    );
  }
  return <input name={arg.name} type="text" value={(arg.value as string) || ""} />;
}

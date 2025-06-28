import { type Signal, createMemo } from "solid-js";

type Args = {
  name: string;
  description: string | undefined;
  value: string | number | boolean | undefined;
  type: string;
  options: string[];
};

export function Controls(props: { storyData; storyUserArgs; variantId }) {
  const args = createMemo(() => {
    const values = props.storyData?.default?.args;
    const types = props.storyData?.default?.argTypes;

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
    const argsSignal = props.storyUserArgs.get(variantId);
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
      onChange={(e) => applyArgs(new FormData(e.currentTarget), props.variantId)}
    >
      <div>
        {args().map((arg, i) => {
          return (
            <div key={`row-${i}`} class="mb-module-m">
              <div class="typo-topline mb-2 flex justify-between">
                <code>{arg.name}</code>
                <code>{arg.type}</code>
              </div>
              <div class="mb-element-xs">{renderControl(arg)}</div>
              <div class="typo-footnote">
                {arg.description ? <span>{arg.description}</span> : ""}
              </div>
            </div>
          );
        })}
      </div>
    </form>
  );
}

function renderControl(arg: Args) {
  if (arg.type === "boolean") {
    return <input name={arg.name} type="checkbox" checked={!!arg.value || undefined} />;
  }
  if (arg.type === "number") {
    return (
      <input class="input" name={arg.name} type="number" value={arg.value as number} />
    );
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
  return (
    <input
      class="input"
      name={arg.name}
      type="text"
      value={(arg.value as string) || ""}
    />
  );
}

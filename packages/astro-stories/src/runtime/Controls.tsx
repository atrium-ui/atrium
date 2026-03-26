import type { ChangeEvent } from "react";
import type { StoryArgValue } from "../story";
import type { ControlItem } from "./story-helpers";

type ControlsProps = {
  items: ControlItem[];
  onChange: (name: string, value: StoryArgValue) => void;
};

function renderControl(
  item: ControlItem,
  onChange: (name: string, value: StoryArgValue) => void,
) {
  if (item.type === "boolean") {
    return (
      <input
        checked={Boolean(item.value)}
        name={item.name}
        type="checkbox"
        onChange={(event) => onChange(item.name, event.currentTarget.checked)}
      />
    );
  }

  if (item.type === "number") {
    return (
      <input
        className="astro-stories-input"
        defaultValue={item.value as number | undefined}
        name={item.name}
        type="number"
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(item.name, Number(event.currentTarget.value))
        }
      />
    );
  }

  if (item.type === "select") {
    return (
      <select
        className="astro-stories-input"
        defaultValue={item.value as string | undefined}
        name={item.name}
        onChange={(event) => onChange(item.name, event.currentTarget.value)}
      >
        {item.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className="astro-stories-input"
      defaultValue={item.value as string | undefined}
      name={item.name}
      type="text"
      onChange={(event) => onChange(item.name, event.currentTarget.value)}
    />
  );
}

export function Controls(props: ControlsProps) {
  return (
    <form className="astro-stories-controls">
      {props.items.map((item) => (
        <label key={item.name} className="astro-stories-control">
          <span className="astro-stories-control-header">
            <code>{item.name}</code>
            <code>{item.type}</code>
          </span>
          {renderControl(item, props.onChange)}
          {item.description ? (
            <span className="astro-stories-control-description">{item.description}</span>
          ) : null}
        </label>
      ))}
    </form>
  );
}

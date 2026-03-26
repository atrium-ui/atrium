import type { Story, StoryArgType, StoryArgValue, StoryModule } from "../story";

export type ControlItem = {
  description?: string;
  name: string;
  options?: string[];
  type: string;
  value: StoryArgValue | undefined;
};

export type ResolvedStory = {
  error?: string;
  story?: Story;
  storyId: string;
  variantId?: string;
};

function getControlType(argType: StoryArgType | undefined, value: StoryArgValue | undefined) {
  return argType?.control?.type ?? typeof value ?? "string";
}

function parseBoolean(rawValue: string) {
  if (rawValue === "true") {
    return true;
  }
  if (rawValue === "false") {
    return false;
  }
  throw new Error(`Expected a boolean query parameter, got "${rawValue}"`);
}

function parseNumber(rawValue: string) {
  const value = Number(rawValue);
  if (Number.isNaN(value)) {
    throw new Error(`Expected a number query parameter, got "${rawValue}"`);
  }
  return value;
}

function parseArgValue(rawValue: string, type: string) {
  if (type === "boolean") {
    return parseBoolean(rawValue);
  }
  if (type === "number") {
    return parseNumber(rawValue);
  }
  return rawValue;
}

function findVariant(module: StoryModule, variantId: string | undefined) {
  if (!variantId) {
    return undefined;
  }

  const normalizedVariantId = variantId.toLowerCase();

  for (const key of Object.keys(module)) {
    if (key === "default") {
      continue;
    }

    if (key.toLowerCase() === normalizedVariantId) {
      return module[key] as Story;
    }
  }

  return undefined;
}

export function getStoryParts(identifier: string | null) {
  if (!identifier) {
    return undefined;
  }

  const [storyId, variantId] = identifier.split("--");
  if (!storyId) {
    throw new Error(`Invalid story identifier "${identifier}"`);
  }

  return {
    storyId,
    variantId,
  };
}

export function getControls(story: Story | undefined): ControlItem[] {
  if (!story) {
    return [];
  }

  const args = story.args ?? {};
  const argTypes = story.argTypes ?? {};
  const controlNames = new Set([...Object.keys(argTypes), ...Object.keys(args)]);

  return [...controlNames].map((name) => {
    const argType = argTypes[name];
    const value = args[name];

    return {
      description: argType?.description,
      name,
      options: argType?.options,
      type: getControlType(argType, value),
      value,
    };
  });
}

export function resolveStory(
  module: StoryModule | null | undefined,
  identifier: string | null,
  searchParams: URLSearchParams,
) {
  const parts = getStoryParts(identifier);
  if (!parts) {
    return undefined;
  }

  if (module === null) {
    return {
      error: `Story not found "${identifier}"`,
      storyId: parts.storyId,
      variantId: parts.variantId,
    } satisfies ResolvedStory;
  }

  if (!module) {
    return {
      storyId: parts.storyId,
      variantId: parts.variantId,
    } satisfies ResolvedStory;
  }

  const baseStory = module.default;
  const variantStory = findVariant(module, parts.variantId);

  const story: Story = {
    ...baseStory,
    ...variantStory,
    args: {
      ...(baseStory.args ?? {}),
      ...(variantStory?.args ?? {}),
    },
    argTypes: {
      ...(baseStory.argTypes ?? {}),
      ...(variantStory?.argTypes ?? {}),
    },
    globals: {
      ...(baseStory.globals ?? {}),
      ...(variantStory?.globals ?? {}),
    },
    parameters: {
      ...(baseStory.parameters ?? {}),
      ...(variantStory?.parameters ?? {}),
    },
  };

  const args = { ...(story.args ?? {}) } satisfies Record<string, StoryArgValue>;
  const argTypes = story.argTypes ?? {};

  for (const [key, rawValue] of searchParams.entries()) {
    if (key === "id" || key === "fill") {
      continue;
    }

    args[key] = parseArgValue(rawValue, getControlType(argTypes[key], args[key]));
  }

  return {
    story: {
      ...story,
      args,
    },
    storyId: parts.storyId,
    variantId: parts.variantId,
  } satisfies ResolvedStory;
}

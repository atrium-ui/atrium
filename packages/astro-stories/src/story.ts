export type StoryArgValue = boolean | number | string;

export type StoryArgType = {
  control?: {
    type?: string;
  };
  description?: string;
  options?: string[];
};

export type Story<
  Args extends Record<string, StoryArgValue> = Record<string, StoryArgValue>,
> = {
  args?: Args;
  argTypes?: Record<string, StoryArgType>;
  globals?: Record<string, Record<string, unknown>>;
  parameters?: Record<string, unknown>;
  render?: (args: Args) => unknown;
  tags?: string[];
};

export type StoryModule = {
  default: Story;
  [key: string]: Story | unknown;
};

export type StoryModuleLoader = () => Promise<StoryModule>;

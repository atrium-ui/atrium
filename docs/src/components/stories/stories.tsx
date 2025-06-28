const storiesImports = import.meta.glob("/src/**/*.stories.*");

type ArgType = any;
type ParamType = any;

export type Story<Args extends Record<string, string | number> = any> = {
  tags?: string[];
  parameters?: Record<string, Record<string, ParamType>>;
  args?: Args;
  argTypes?: Record<string, Record<string, ArgType>>;
  render?: (args: Args) => any;
};

export type StoryIndex = {
  default: Story<any>;
  [key: string]: Story<any>;
} & {
  _id: string;
};

const stories = new Map<string | undefined, () => Promise<StoryIndex>>();

for (const key in storiesImports) {
  const storyId = key.split("/").pop()?.replace(".stories.ts", "").toLowerCase();
  if (storyId) {
    stories.set(storyId, storiesImports[key] as any);
  }
}

export { stories };

const storiesImports = import.meta.glob("/src/**/*.stories.*");

type ArgType = any;
type ParamType = any;

export type Story<Template = unknown> = {
  tags: string[];
  parameters: Record<string, Record<string, ParamType>>;
  args: Record<string, string | number>;
  argTypes: Record<string, Record<string, ArgType>>;
  render: () => Template;
};

export type StoryIndex = {
  default: Story;
  [key: string]: Story;
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

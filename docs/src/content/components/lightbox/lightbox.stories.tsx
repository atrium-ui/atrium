/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Lightbox } from "@components/src/vue";

export default {
  tags: ["public"],
  args: {},
} satisfies Story;

export const Default = {
  render: () => {
    return (
      <div class="flex min-h-[600px] max-w-full items-center justify-center p-4">
        <Lightbox>
          <img
            src="https://picsum.photos/id/12/1280/720"
            alt="Landscape photograph"
            loading="lazy"
            decoding="async"
            class="h-auto w-full"
          />
        </Lightbox>
      </div>
    );
  },
};

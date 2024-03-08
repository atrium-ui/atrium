import { Button } from "./button.jsx";

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface Props {}

export function ImageText(props: Props) {
  return (
    <div class="grid-gap !gap-y-10 grid grid-cols-10 xl:grid-cols-8">
      <div class="col-span-10 lg:col-span-7 md:col-span-6 xl:col-span-5">
        <h3 class="pb-6 text-4xl">Image Text</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas asperiores,
          quisquam, voluptates, voluptatum quibusdam accusantium quos voluptatem quia
          doloribus quidem provident. Quisquam, voluptatem. Quisquam, voluptatem.
        </p>

        <div class="pt-10">
          <Button>Button</Button>
        </div>
      </div>

      <div class="col-span-6 col-start-6 lg:col-span-3 md:col-span-4 md:pl-10">
        <figure>
          <img
            class="h-auto w-full"
            src="https://picsum.photos/300/300"
            width="300"
            height="300"
            alt="alt"
            load="async"
          />
          <figcaption class="text-sm">
            <p>Caption</p>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

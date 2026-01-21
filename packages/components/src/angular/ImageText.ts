import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Button } from "./Button.js";

@Component({
  selector: "fra-image-text",
  standalone: true,
  imports: [CommonModule, Button],
  template: `
    <div class="grid-gap grid grid-cols-10 gap-y-10! xl:grid-cols-8">
      <div class="col-span-10 md:col-span-6 lg:col-span-7 xl:col-span-5">
        <h3 class="pb-6 text-4xl">Image Text</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas asperiores,
          quisquam, voluptates, voluptatum quibusdam accusantium quos voluptatem quia
          doloribus quidem provident. Quisquam, voluptatem. Quisquam, voluptatem.
        </p>

        <div class="pt-10">
          <fra-button>Button</fra-button>
        </div>
      </div>

      <div class="col-span-6 col-start-6 md:col-span-4 md:pl-10 lg:col-span-3">
        <figure>
          <img
            class="h-auto w-full object-cover"
            [src]="image"
            width="300"
            height="300"
            alt="alt"
            loading="lazy"
          />
          <figcaption class="text-sm">
            <p>Caption</p>
          </figcaption>
        </figure>
      </div>
    </div>
  `,
})
export class ImageText {
  @Input() image!: string;
}

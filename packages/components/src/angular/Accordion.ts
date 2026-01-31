import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import "@sv/elements/expandable";
import "@sv/svg-sprites/svg-icon";

@Component({
  selector: "fra-accordion",
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul class="flex list-none flex-col gap-3 p-0">
      <ng-content></ng-content>
    </ul>
  `,
})
export class Accordion {}

@Component({
  selector: "fra-accordion-item",
  standalone: true,
  imports: [CommonModule],
  template: `
    <li>
      <a-expandable class="group block rounded-md bg-gray-100" [attr.opened]="opened || null">
        <button
          slot="toggle"
          type="button"
          class="flex w-full cursor-pointer items-center justify-between gap-x-6 px-3 py-3 text-left font-light text-xl italic md:px-4 md:py-5"
        >
          <div class="pointer-events-none max-w-[50rem]">
            <span>{{ title }}</span>
          </div>
          <div>
            <svg-icon
              class="group-[[opened]]:-scale-100"
              name="chevron-down"
            ></svg-icon>
          </div>
        </button>
        <div class="px-3 pb-4 md:px-4 md:pb-6">
          <div>
            <ng-content></ng-content>
          </div>
        </div>
      </a-expandable>
    </li>
  `,
})
export class AccordionItem {
  @Input() title!: string;
  @Input() opened?: boolean;
}

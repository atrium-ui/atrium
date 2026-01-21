import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { twMerge } from "tailwind-merge";

@Component({
  selector: "fra-breadcrumbs",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getContainerClass()">
      <a-track class="overflow-hidden">
        <div class="relative whitespace-nowrap pr-4">
          <fra-link href="/">
            <fra-icon name="home"></fra-icon>
          </fra-link>
          <span class="mx-1">/</span>
          <span class="[&_*:not(:last-child)]:after:mx-1 [&_*:not(:last-child)]:after:content-['/'] [&_*:not(:last-child)]:hover:text-[#666]">
            <ng-content></ng-content>
          </span>
        </div>
      </a-track>
      <div class="absolute top-0 right-0 h-full w-4 bg-gradient-to-r from-transparent to-white"></div>
    </div>
  `,
})
export class Breadcrumbs {
  getContainerClass() {
    return twMerge("relative block min-h-[1.5rem]");
  }
}

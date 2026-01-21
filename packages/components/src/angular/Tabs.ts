import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Button } from "./Button.js";
import { twMerge } from "tailwind-merge";
import "@sv/elements/track";

@Component({
  selector: "fra-tabs",
  standalone: true,
  imports: [CommonModule, Button],
  template: `
    <div class="w-full p-1">
      <a-track>
        <ul class="flex list-none gap-1 p-0">
          <li *ngFor="let item of items; let i = index" [attr.key]="'tab_' + i">
            <fra-button
              variant="ghost"
              [class]="getTabClass(i)"
              (clicked)="handleTabClick(i)"
            >
              {{ item }}
            </fra-button>
          </li>
        </ul>
      </a-track>
    </div>
  `,
})
export class Tabs {
  @Input() active: number = 0;
  @Input() items: string[] = [];
  @Output() changeEvent = new EventEmitter<number>();

  handleTabClick(index: number) {
    this.active = index;
    this.changeEvent.emit(index);
  }

  getTabClass(index: number) {
    return twMerge(
      "whitespace-nowrap rounded-lg bg-transparent opacity-30",
      this.active === index ? "opacity-100" : "",
    );
  }
}

@Component({
  selector: "fra-tab-item",
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
  `,
})
export class TabItem {}

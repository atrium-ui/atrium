import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Button } from "./Button.js";
import "@sv/elements/popover";

@Component({
  selector: "fra-tooltip",
  standalone: true,
  imports: [CommonModule, Button],
  template: `
    <a-popover-trigger class="relative z-10">
      <div slot="trigger">
        <fra-button
          *ngIf="label"
          slot="trigger"
          variant="outline"
        >
          {{ label }}
        </fra-button>
        <ng-content *ngIf="!label" select="[input]"></ng-content>
      </div>

      <a-tooltip class="group">
        <div class="pointer-events-auto w-[max-content] p-2 opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100">
          <div
            [class]="getTooltipClass()"
          >
            <ng-content></ng-content>
          </div>
        </div>
      </a-tooltip>
    </a-popover-trigger>
  `,
})
export class Tooltip {
  @Input() label?: string;

  getTooltipClass() {
    return [
      "min-w-[100px] rounded-md border border-zinc-200 bg-zinc-50 p-1",
      "scale-95 transition-all duration-150 group-[&[enabled]]:scale-100",
    ].join(" ");
  }
}

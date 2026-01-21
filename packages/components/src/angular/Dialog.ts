import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Button } from "./Button.js";
import "@sv/elements/blur";
import "@sv/elements/portal";

@Component({
  selector: "fra-dialog",
  standalone: true,
  imports: [CommonModule, Button],
  template: `
    <div>
      <fra-button
        [class]="class"
        (clicked)="open = true"
      >
        {{ label }}
      </fra-button>

      <a-portal>
        <a-blur
          [attr.enabled]="open || null"
          class="group/dialog fixed top-0 left-0 z-50 block h-full w-full transition-colors [&[enabled]]:bg-[#00000010]"
          (exit)="open = false"
        >
          <div
            [class]="getDialogClass()"
          >
            <ng-content></ng-content>
          </div>
        </a-blur>
      </a-portal>
    </div>
  `,
})
export class Dialog {
  @Input() label?: string;
  @Input() class?: string;

  open = false;

  getDialogClass() {
    return [
      "rounded-lg border px-8 py-8 opacity-0 transition-all",
      "border-zinc-200 bg-zinc-50",
      "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 min-w-[400px]",
      "scale-95 group-[&[enabled]]/dialog:block group-[&[enabled]]/dialog:scale-100 group-[&[enabled]]/dialog:opacity-100",
    ].join(" ");
  }
}

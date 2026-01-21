import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Icon } from "./Icon.js";

@Component({
  selector: "fra-checkbox",
  standalone: true,
  imports: [CommonModule, Icon],
  template: `
    <div class="flex items-start gap-3">
      <button
        role="checkbox"
        [attr.aria-checked]="checked"
        [attr.aria-label]="label"
        type="button"
        [attr.aria-labelledby]="'label_' + name"
        (click)="handleToggle()"
        [class]="getButtonClass()"
      >
        <div
          aria-hidden="true"
          [class]="getIconWrapperClass()"
        >
          <fra-icon name="check"></fra-icon>
        </div>
      </button>

      <input
        #hiddenInput
        inert
        [required]="required || null"
        type="checkbox"
        class="hidden"
        [id]="'input_' + name"
        [name]="name"
        [checked]="checked || null"
        (input)="handleInputChange($event)"
      />

      <label
        [id]="'label_' + name"
        [for]="'input_' + name"
        class="cursor-pointer text-lg"
      >
        <ng-content></ng-content>
      </label>
    </div>
  `,
})
export class Checkbox {
  @Input() name!: string;
  @Input() checked?: boolean;
  @Input() required?: boolean;
  @Input() label?: string;
  @Output() changeEvent = new EventEmitter<Event>();

  handleToggle() {
    this.checked = !this.checked;
    const event = new Event("change", { bubbles: true });
    this.changeEvent.emit(event);
  }

  handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
  }

  getButtonClass() {
    return [
      "mt-[2px] h-6 w-6 cursor-pointer rounded-md border border-zinc-200 bg-transparent p-0 align-bottom hover:border-zinc-600",
      "outline-hidden focus:ring-2 focus:ring-[currentColor]",
    ].join(" ");
  }

  getIconWrapperClass() {
    return ["flex items-center justify-center", !this.checked && "hidden"].join(" ");
  }
}

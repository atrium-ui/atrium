import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "fra-switch",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3">
      <label
        *ngIf="label"
        [id]="'label_' + name"
        [for]="'input_' + name"
        class="cursor-pointer text-lg"
      >
        {{ label }}
      </label>

      <a-toggle
        [class]="getToggleClass()"
        [attr.name]="name"
        [attr.value]="value?.toString()"
        [attr.required]="required || null"
        (change)="handleChange($event)"
      >
        <div
          [class]="getSwitchClass()"
        />
      </a-toggle>
    </div>
  `,
})
export class Switch {
  @Input() name?: string;
  @Input() value?: boolean;
  @Input() required?: boolean;
  @Input() label?: string;
  @Output() changeEvent = new EventEmitter<Event>();

  handleChange(event: Event) {
    this.changeEvent.emit(event);
  }

  getToggleClass() {
    return [
      "group inline-flex",
      "mt-[2px] w-12 cursor-pointer overflow-hidden rounded-full border border-zinc-200 bg-transparent",
      "outline-hidden focus:ring-2 focus:ring-[currentColor]",
    ].join(" ");
  }

  getSwitchClass() {
    return [
      "relative block h-6 w-12 rounded-full bg-[var(--theme-color,#bfa188)] transition-transform",
      "after:absolute after:top-0 after:right-0 after:h-6 after:w-6 after:rounded-full after:bg-[currentColor] after:content-['']",
      "-translate-x-1/2 group-[&[value='true']]:translate-x-0",
    ].join(" ");
  }
}

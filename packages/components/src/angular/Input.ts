import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: [
    "group w-full resize-y rounded-md border border-zinc-200 bg-transparent leading-normal px-3 py-1 hover:border-zinc-400",
    "outline-hidden focus-within:ring-2 focus-within:ring-[currentColor]",
  ],
  error: ["border-red-600"],
};

@Component({
  selector: 'fra-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div
        [class]="getWrapperClass()"
      >
        <ng-content></ng-content>

        <ng-content select="[prefix]"></ng-content>

        <textarea
          *ngIf="multiline"
          rows="6"
          [id]="id"
          [name]="name"
          [autofocus]="autofocus"
          [readonly]="readonly"
          [required]="required || null"
          [placeholder]="placeholder"
          class="m-0 flex-1 border-none bg-transparent p-0 outline-hidden"
          [value]="value || ''"
          (change)="handleChange($event)"
          (input)="handleInput($event)"
          (invalid)="handleInvalid($event)"
        ></textarea>

        <input
          *ngIf="!multiline"
          [type]="type"
          [id]="id"
          [name]="name"
          [autocomplete]="autocomplete"
          [autofocus]="autofocus"
          [readonly]="readonly"
          [required]="required || null"
          [placeholder]="placeholder"
          class="m-0 flex-1 border-none bg-transparent p-0 outline-hidden"
          [value]="value || ''"
          [minlength]="minlength"
          (change)="handleChange($event)"
          (keydown)="handleKeydown($event)"
          (keyup)="handleKeyup($event)"
          (input)="handleInput($event)"
          (invalid)="handleInvalid($event)"
        />

        <ng-content select="[suffix]"></ng-content>
      </div>

      <div *ngIf="error" class="pt-2 text-md text-yellow">
        <label>{{ error }}</label>
      </div>
    </div>
  `,
})
export class Input {
  @Input() class?: string | string[];
  @Input() autofocus?: boolean;
  @Input() placeholder?: string;
  @Input() name?: string;
  @Input() id?: string;
  @Input() value?: string;
  @Input() type?: string;
  @Input() error?: string;
  @Input() required?: boolean;
  @Input() autocomplete?: string;
  @Input() minlength?: number;
  @Input() readonly?: boolean;
  @Input() multiline?: boolean;

  @Output() invalidEvent = new EventEmitter<Event>();
  @Output() inputEvent = new EventEmitter<Event>();
  @Output() changeEvent = new EventEmitter<Event>();
  @Output() keydownEvent = new EventEmitter<KeyboardEvent>();
  @Output() keyupEvent = new EventEmitter<KeyboardEvent>();

  handleInvalid(e: Event) {
    this.invalidEvent.emit(e);
  }

  handleInput(e: Event) {
    this.inputEvent.emit(e);
  }

  handleChange(e: Event) {
    this.changeEvent.emit(e);
  }

  handleKeydown(e: KeyboardEvent) {
    this.keydownEvent.emit(e);
  }

  handleKeyup(e: KeyboardEvent) {
    this.keyupEvent.emit(e);
  }

  getWrapperClass() {
    return twMerge(
      "flex",
      variants.default,
      this.error && variants.error,
      this.multiline && "mt-4 min-h-10 px-5 lg:px-2",
      this.class,
    );
  }
}
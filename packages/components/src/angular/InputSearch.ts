import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Input as InputComponent } from "./Input.js";

@Component({
  selector: "fra-input-search",
  standalone: true,
  imports: [CommonModule, InputComponent],
  template: `
    <fra-input
      [placeholder]="placeholder"
      [class]="class"
      type="search"
      autocomplete="search"
      (keydownEvent)="handleKeydown($event)"
      (inputEvent)="handleInput($event)"
      [value]="value"
    >
      <ng-content></ng-content>
    </fra-input>
  `,
})
export class InputSearch {
  @Input() class?: string | string[];
  @Input() value?: string;
  @Input() placeholder?: string;
  @Output() keydownEvent = new EventEmitter<KeyboardEvent>();
  @Output() inputEvent = new EventEmitter<Event>();

  handleKeydown(e: KeyboardEvent) {
    this.keydownEvent.emit(e);
  }

  handleInput(e: Event) {
    this.inputEvent.emit(e);
  }
}

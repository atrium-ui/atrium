import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input as InputComponent } from './Input';

@Component({
  selector: 'fra-input-email',
  standalone: true,
  imports: [CommonModule, InputComponent],
  template: `
    <fra-input
      [class]="class"
      type="email"
      autocomplete="email"
      [value]="value"
    ></fra-input>
  `,
})
export class InputEmail {
  @Input() class?: string | string[];
  @Input() value?: string;
}
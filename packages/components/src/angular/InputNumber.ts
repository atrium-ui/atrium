import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Input as InputComponent } from "./Input.js";

@Component({
  selector: "fra-input-number",
  standalone: true,
  imports: [CommonModule, InputComponent],
  template: `
    <fra-input
      [class]="class"
      type="number"
      [value]="value"
    ></fra-input>
  `,
})
export class InputNumber {
  @Input() class?: string | string[];
  @Input() value?: string;
}

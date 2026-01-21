import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Input as InputComponent } from "./Input.js";

@Component({
  selector: "fra-input-password",
  standalone: true,
  imports: [CommonModule, InputComponent],
  template: `
    <fra-input
      [class]="class"
      type="password"
      autocomplete="password"
      [value]="value"
    ></fra-input>
  `,
})
export class InputPassword {
  @Input() class?: string | string[];
  @Input() value?: string;
}

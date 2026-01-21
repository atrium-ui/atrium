import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import "@sv/svg-sprites/svg-icon";

@Component({
  selector: "fra-icon",
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg-icon
      aria-hidden="true"
      [class]="getIconClass()"
      [attr.name]="name || 'unknown'"
    ></svg-icon>
  `,
})
export class Icon {
  @Input() name!: string;
  @Input() class?: string | string[];

  getIconClass() {
    const classes = ["flex-none aspect-square h-[1em] w-[1em]"];

    if (this.class) {
      if (Array.isArray(this.class)) {
        classes.push(...this.class);
      } else {
        classes.push(this.class);
      }
    }

    return classes.join(" ");
  }
}

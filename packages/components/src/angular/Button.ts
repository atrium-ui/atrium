import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { twMerge } from "tailwind-merge";

export const buttonVariants = {
  base: [
    "flex cursor-pointer items-center gap-2 leading-normal",
    "rounded-lg px-3 py-1 transition-all active:transition-none",
    "outline-none focus:ring focus:ring-[currentColor]",
  ],
  default: [
    "bg-[var(--theme-color,#bfa188)]",
    "filter active:brightness-90 hover:brightness-110 active:contrast-125",
    "border border-zinc-200",
  ],
  outline: [
    "bg-transparent hover:bg-[rgba(150,150,150,0.1)]",
    "filter active:brightness-90 hover:brightness-110 active:contrast-125",
    "border border-zinc-200",
  ],
  ghost: [
    "bg-transparent active:bg-[rgba(150,150,150,0.1)]",
    "filter hover:brightness-110",
  ],
  disabled: ["cursor-not-allowed opacity-50"],
};

@Component({
  selector: "fra-button",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [attr.inert]="inert || null"
      [attr.slot]="slot || null"
      [attr.aria-disabled]="disabled || null"
      [class]="getButtonClass()"
      (click)="handleClick($event)"
      [title]="label"
      [attr.aria-label]="label"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class Button {
  @Input() type: "button" | "submit" | "reset" = "button";
  @Input() inert?: boolean;
  @Input() class?: string | string[];
  @Input() slot?: string;
  @Input() disabled?: boolean;
  @Input() variant?: keyof typeof buttonVariants = "default";
  @Input() label?: string;
  @Output() clicked = new EventEmitter<MouseEvent>();

  handleClick(e: MouseEvent) {
    if (this.disabled || this.clicked.observed) {
      e.preventDefault();
    }
    if (this.clicked.observed && !this.disabled) {
      this.clicked.emit(e);
    }
  }

  getButtonClass() {
    return twMerge(
      buttonVariants.base,
      buttonVariants[this.variant],
      this.class,
      this.disabled && buttonVariants.disabled,
    );
  }
}

@Component({
  selector: "fra-link",
  standalone: true,
  imports: [CommonModule],
  template: `
    <a
      [class]="getLinkClass()"
      [href]="href"
      [target]="target"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class Link {
  @Input() variant?: keyof Omit<typeof buttonVariants, "base"> = "default";
  @Input() href!: string;
  @Input() target?: string;

  getLinkClass() {
    return twMerge(
      "inline text-inherit no-underline",
      "transition-all active:transition-none",
      this.variant && buttonVariants.base,
      buttonVariants[this.variant],
    );
  }
}

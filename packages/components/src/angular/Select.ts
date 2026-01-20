import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from './Button';
import { twMerge } from 'tailwind-merge';
import '@sv/elements/select';
import '@sv/elements/expandable';

@Component({
  selector: 'fra-select',
  standalone: true,
  imports: [CommonModule, Button],
  template: `
    <div>
      <div *ngIf="label" class="pb-1 text-sm">
        <label [for]="name">{{ label }}</label>
      </div>

      <a-select
        [attr.required]="required || null"
        [attr.value]="value"
        [attr.name]="name"
        (change)="handleChange($event)"
        class="relative inline-block w-full"
      >
        <fra-button class="w-full" slot="trigger" [attr.aria-label]="label">
          <div class="min-w-[150px] text-left">{{ value || placeholder }}</div>
        </fra-button>

        <div class="mt-1 rounded-md border border-zinc-200 bg-zinc-50 p-1">
          <ng-content></ng-content>
        </div>
      </a-select>
    </div>
  `,
})
export class Select {
  @Input() name!: string;
  @Input() placeholder!: string;
  @Input() label?: string;
  @Input() value?: string;
  @Input() required?: boolean;
  @Output() selectEvent = new EventEmitter<CustomEvent>();

  handleChange(ev: any) {
    this.value = ev.target?.value;
    this.selectEvent.emit(ev);
  }
}

@Component({
  selector: 'fra-select-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a-option
      [class]="getItemClass()"
      [attr.value]="value"
    >
      <div>
        <ng-content></ng-content>
        <span *ngIf="!hasContent">{{ value }}</span>
      </div>
    </a-option>
  `,
})
export class SelectItem {
  @Input() value!: string;
  @Input() class?: string;
  
  hasContent = false;

  ngAfterContentInit() {
    this.hasContent = true;
  }

  getItemClass() {
    return twMerge(
      "block cursor-pointer rounded-sm px-2",
      "hover:bg-zinc-100 active:bg-zinc-200 [&[selected]]:bg-zinc-200",
      "dark:active:bg-zinc-700 dark:hover:bg-zinc-600 dark:[&[selected]]:bg-zinc-700",
      this.class,
    );
  }
}
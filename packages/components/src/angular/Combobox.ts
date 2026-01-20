import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputSearch } from './InputSearch';
import { twMerge } from 'tailwind-merge';
import '@sv/elements/select';
import '@sv/elements/expandable';
import type { OptionElement, Select } from '@sv/elements/select';

@Component({
  selector: 'fra-combobox-item',
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
export class ComboboxItem {
  @Input() value!: string;
  @Input() class?: string;
  
  hasContent = false;

  ngAfterContentInit() {
    this.hasContent = true;
  }

  getItemClass() {
    return twMerge(
      'block cursor-pointer rounded-sm px-2',
      'hover:bg-zinc-100 active:bg-zinc-200 [&[selected]]:bg-zinc-200',
      this.class,
    );
  }
}

@Component({
  selector: 'fra-combobox',
  standalone: true,
  imports: [CommonModule, InputSearch, ComboboxItem],
  template: `
    <div>
      <a-select
        #selectElement
        [attr.multiple]="true"
        [attr.required]="required || null"
        [attr.value]="value"
        [attr.name]="name"
        (change)="handleChange($event)"
        class="relative inline-block w-full"
      >
        <div slot="trigger" class="w-full">
          <fra-input-search
            class="px-1"
            [placeholder]="placeholder"
            [value]="filter"
            (keydownEvent)="handleKeydown($event)"
            (inputEvent)="handleInput($event)"
          >
            <div class="flex pr-2">
              <div
                *ngFor="let option of values; let i = index"
                class="mr-1 flex items-center gap-1 whitespace-nowrap rounded-sm bg-zinc-50 pr-1 pl-2 text-left text-sm leading-none"
              >
                <span>{{ option.innerText }}</span>

                <button
                  type="button"
                  (click)="removeOption(i)"
                  class="flex items-center justify-center rounded-full bg-zinc-50 p-0 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-[currentColor]"
                >
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-4 w-4"
                  >
                    <title>Remove</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </fra-input-search>
        </div>

        <div class="mt-1 rounded-md border border-zinc-200 bg-zinc-50 p-1">
          <fra-combobox-item
            *ngFor="let option of filteredOptions"
            [value]="option.value"
          >
            {{ option.label }}
          </fra-combobox-item>
        </div>
      </a-select>
    </div>
  `,
})
export class Combobox {
  @Input() placeholder?: string;
  @Input() name?: string;
  @Input() value?: string;
  @Input() required?: boolean;
  @Input() options: Array<{ label: string; value: string }> = [];
  @Output() changeEvent = new EventEmitter<CustomEvent>();

  @ViewChild('selectElement') selectElement?: ElementRef<Select>;

  values: OptionElement[] = [];
  filter = '';

  get filteredOptions() {
    if (!this.filter) {
      return this.options;
    }
    return this.options.filter(opt => opt.label.match(this.filter));
  }

  handleKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement;
    if (e.key === 'Backspace' && target.value?.length === 0) {
      this.values.pop();
    }
  }

  async handleChange(ev: any) {
    this.value = ev.option;
    this.changeEvent.emit(ev);
    if (ev.option && this.values.indexOf(ev.option) === -1) {
      this.values.push(ev.option);
    }
    this.filter = '';
  }

  handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.filter = target.value;
    this.selectElement?.nativeElement?.open();
  }

  removeOption(index: number) {
    this.values.splice(index, 1);
  }
}
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input as InputComponent } from './Input';
import '@sv/elements/popover';

@Component({
  selector: 'fra-datepicker',
  standalone: true,
  imports: [CommonModule, InputComponent],
  template: `
    <a-popover-trigger class="relative z-10">
      <div slot="trigger">
        <fra-input
          placeholder="Select a date"
          [value]="value"
        ></fra-input>
      </div>

      <a-popover class="group" placements="bottom">
        <div class="w-[max-content] p-3 opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100">
          <div class="min-w-[100px] scale-95 rounded-md bg-white p-1 shadow-lg transition-all duration-150 group-[&[enabled]]:scale-100">
            <a-calendar
              (change)="handleChange($event)"
            ></a-calendar>
          </div>
        </div>
      </a-popover>
    </a-popover-trigger>
  `,
})
export class Datepicker {
  @Output() changeEvent = new EventEmitter<CustomEvent<{ date: Date }>>();

  value?: string;

  handleChange(ev: any) {
    this.value = ev.target.value;
    this.changeEvent.emit(ev);
    requestAnimationFrame(() => {
      ev.target.dispatchEvent(new CustomEvent('exit'));
    });
  }
}
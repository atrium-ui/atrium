import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Button } from "./Button.js";
import { twMerge } from "tailwind-merge";
import "@sv/elements/transition";
import "@sv/elements/form";

@Component({
  selector: "fra-form",
  standalone: true,
  imports: [CommonModule, Button],
  template: `
    <div>
      <div *ngIf="success">
        <h2>Success</h2>
        <p>{{ success }}</p>
      </div>

      <form *ngIf="!success" (submit)="handleSubmit($event)">
        <div class="flex flex-col gap-4">
          <ng-content></ng-content>
        </div>

        <fra-button
          type="submit"
          [class]="getSubmitClass()"
        >
          <a-transition>
            <div class="flex items-center gap-2">
              <span>{{ submitLabel || 'Submit' }}</span>
              <span *ngIf="loading" class="loading-indicator flex-none"></span>
            </div>
          </a-transition>
        </fra-button>
      </form>

      <div *ngIf="error" class="text-red-600">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
})
export class Form {
  @Input() submitLabel?: string;
  @Input() submitClass?: string;
  @Output() submitEvent = new EventEmitter<FormData>();

  error?: string;
  success?: string;
  loading = false;

  async handleSubmit(e: Event) {
    const form = e.currentTarget as HTMLFormElement;

    e.preventDefault();
    e.stopPropagation();

    this.loading = true;

    try {
      const data = new FormData(form);
      this.submitEvent.emit(data);
      this.error = undefined;
    } catch (err: any) {
      this.error = err;
      console.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  getSubmitClass() {
    return twMerge("mt-8 overflow-hidden", this.submitClass);
  }
}

@Component({
  selector: "fra-form-field",
  standalone: true,
  imports: [CommonModule],
  template: `
    <a-form-field>
      <div>
        <div *ngIf="field.label" class="pb-1">
          <label [for]="field.name" class="font-bold text-xs uppercase">
            {{ !field.description ? field.label : '' }}
          </label>
        </div>

        <ng-content></ng-content>

        <div *ngIf="field.description" class="form-field-description">
          <label [for]="field.name">{{ field.description }}</label>
        </div>
      </div>

      <div class="pt-1 text-red-400 text-xs">
        <a-form-field-error></a-form-field-error>
      </div>
    </a-form-field>
  `,
})
export class FormField {
  @Input() field!: {
    name: string;
    label?: string;
    description?: string;
    error?: string;
  };
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from './Button';
import { Icon } from './Icon';
import { Toast, ToastFeed } from '@sv/elements/toast';

const TOAST_TYPE = {
  default: 'default',
  error: 'error',
  transparent: 'transparent',
};

type ToastButton = {
  label: string;
  onClick: () => void;
};

export interface ToastOptions {
  id?: string;
  message?: string;
  button?: ToastButton;
  icon?: string;
  time?: number;
  variant?: keyof typeof TOAST_TYPE;
}

const toasts: Map<string, Toast> = new Map();

export function toast(options: ToastOptions) {
  if (options.id && toasts.has(options.id)) {
    const toast = toasts.get(options.id);
    toast?.kill();
    toasts.delete(options.id);
  }

  const toast = new Toast({ time: options.time });
  toast.className = `variant-${options.variant || TOAST_TYPE.default}`;
  
  const contentElement = document.createElement('toast-content');
  if (options.message) contentElement.setAttribute('message', options.message);
  if (options.icon) contentElement.setAttribute('icon', options.icon);
  if (options.button) {
    contentElement.setAttribute('button-label', options.button.label);
    contentElement.addEventListener('button-click', () => options.button?.onClick());
  }
  
  toast.append(contentElement);

  const feed = ToastFeed.getInstance();
  feed?.append(toast);
  if (options.id) toasts.set(options.id, toast);

  return toast;
}

@Component({
  selector: 'toast-content',
  standalone: true,
  imports: [CommonModule, Button, Icon],
  template: `
    <div class="flex gap-4 rounded-lg bg-white px-6 py-4 text-black shadow-md">
      <fra-icon *ngIf="icon" class="flex-none text-xl" [name]="icon"></fra-icon>
      <div>
        <div class="pointer-events-none pb-4">{{ message }}</div>
        <fra-button
          *ngIf="buttonLabel"
          class="text-button"
          (clicked)="handleButtonClick()"
        >
          {{ buttonLabel }}
        </fra-button>
      </div>
    </div>
  `,
})
export class ToastContent {
  @Input() message!: string;
  @Input() icon?: string;
  @Input() buttonLabel?: string;

  handleButtonClick() {
    const event = new CustomEvent('button-click');
    if (this.nativeElement) {
      this.nativeElement.dispatchEvent(event);
    }
  }

  private nativeElement?: HTMLElement;

  ngOnInit() {
    if (typeof document !== 'undefined') {
      this.nativeElement = document.querySelector('toast-content') || undefined;
    }
  }
}

@Component({
  selector: 'fra-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pointer-events-none absolute right-0 bottom-4 z-100 w-full md:max-w-[460px] lg:right-4">
      <a-toast-feed class="px-4 text-base *:pointer-events-auto"></a-toast-feed>
    </div>
  `,
})
export class Toasts {}
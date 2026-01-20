import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from './Button';
import { Icon } from './Icon';
import '@sv/elements/blur';
import '@sv/elements/portal';

@Component({
  selector: 'fra-lightbox',
  standalone: true,
  imports: [CommonModule, Button, Icon],
  template: `
    <>
      <button
        type="button"
        class="m-0 block cursor-pointer bg-transparent p-0"
        (click)="open = true"
      >
        <img
          class="max-w-[200px] bg-zinc-400 object-cover"
          src="https://picsum.photos/id/12/320/180"
          alt=""
        />
      </button>

      <a-portal>
        <a-blur
          [attr.enabled]="open || null"
          [class]="getBlurClass()"
          (exit)="open = false"
        >
          <div
            [class]="getContentClass()"
          >
            <ng-content></ng-content>
          </div>

          <div class="absolute top-8 right-4 z-50 text-2xl lg:top-20 lg:right-20">
            <fra-button
              label="close"
              variant="ghost"
              (clicked)="open = false"
            >
              <fra-icon name="close"></fra-icon>
            </fra-button>
          </div>
        </a-blur>
      </a-portal>
    </>
  `,
})
export class Lightbox {
  open = false;

  getBlurClass() {
    return [
      'group/dialog fixed top-0 left-0 z-50 block h-screen w-screen opacity-0 transition-all',
      '[&[enabled]]:bg-[#33333333] [&[enabled]]:opacity-100 [&[enabled]]:backdrop-blur-md',
    ].join(' ');
  }

  getContentClass() {
    return [
      '-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 transition-all',
      'scale-105 group-[&[enabled]]/dialog:block group-[&[enabled]]/dialog:scale-100',
    ].join(' ');
  }
}
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import '@sv/elements/portal';
import '@sv/elements/blur';

@Component({
  selector: 'fra-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a-portal>
      <a-blur
        id="sheet"
        scrolllock
        [attr.enabled]="enabled || null"
        class="group/blur fixed top-0 left-0 block h-full w-full transition-all [&[enabled]]:bg-[#33333333]"
      >
        <div
          [class]="getSheetClass()"
        >
          <ng-content></ng-content>
        </div>
      </a-blur>
    </a-portal>
  `,
})
export class Sheet {
  @Input() enabled?: boolean;

  getSheetClass() {
    return [
      'group-[&[enabled]]/blur:-translate-x-full absolute top-0 left-full h-full w-full overflow-auto px-4 py-12 transition-all sm:w-96',
      'bg-zinc-100',
    ].join(' ');
  }
}
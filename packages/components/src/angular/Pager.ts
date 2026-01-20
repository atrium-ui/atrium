import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fra-pager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <ng-content></ng-content>
    </div>
  `,
})
export class Pager {}
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationElement } from '@sv/animation';
import riveWASMResource from '@rive-app/canvas-advanced-lite/rive.wasm?url';

AnimationElement.riveWasm = riveWASMResource;

@Component({
  selector: 'fra-animation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a-animation
      [attr.height]="height || 400"
      [attr.width]="width || 400"
      [attr.src]="src"
    ></a-animation>
  `,
})
export class Animation {
  @Input() src!: string;
  @Input() width?: number;
  @Input() height?: number;
}
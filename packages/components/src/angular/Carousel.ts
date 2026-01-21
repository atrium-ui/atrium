import { Component, Input, type OnInit, ViewChild, type ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Button } from "./Button.js";
import { Icon } from "./Icon.js";
import { twMerge } from "tailwind-merge";
import "@sv/elements/track";
import type { Track } from "@sv/elements/track";

@Component({
  selector: "fra-carousel",
  standalone: true,
  imports: [CommonModule, Button, Icon],
  template: `
    <div [class]="getContainerClass()">
      <div class="relative w-full">
        <a-track
          #track
          snap
          debug
          class="flex w-full overflow-visible"
          [attr.align]="align"
          [attr.overflow]="overflow"
          (scroll)="handleScroll()"
          (change)="handleChange()"
          (format)="handleFormat()"
        >
          <ng-content></ng-content>
        </a-track>

        <div>
          <fra-button
            [disabled]="!showPrev"
            class="-translate-y-1/2 absolute top-1/2 left-[12px] z-10 hidden transform text-black opacity-0 transition-opacity group-hover/slider:opacity-100 lg:block"
            (clicked)="prev()"
            label="Previous page"
          >
            <fra-icon class="block drop-shadow-[2px_2px_6px_black]" name="arrow-left"></fra-icon>
          </fra-button>
          <fra-button
            [disabled]="!showNext"
            class="-translate-y-1/2 absolute top-1/2 right-[12px] z-10 hidden transform text-black opacity-0 transition-opacity group-hover/slider:opacity-100 lg:block"
            (clicked)="next()"
            label="Next page"
          >
            <fra-icon class="block drop-shadow-[2px_2px_6px_black]" name="arrow-right"></fra-icon>
          </fra-button>
        </div>
      </div>

      <div class="flex justify-center @lg:py-8 pt-5 pb-2">
        <div
          [class]="getProgressClass()"
          [style.--value]="progress"
        >
          <div
            [class]="getProgressBarClass()"
          />
        </div>
      </div>
    </div>
  `,
})
export class Carousel implements OnInit {
  @Input() class?: string;
  @Input() overflow?: string;
  @Input() align?: "start" | "center";

  @ViewChild("track") trackElement?: ElementRef<Track>;

  current = 0;
  position = 0;
  meta = {
    overflowWidth: 0,
    itemCount: 0,
    width: 0,
  };

  get progress(): number {
    const value = 1 - (this.meta.overflowWidth - this.position) / this.meta.overflowWidth;
    return Math.min(1, Math.max(0, value));
  }

  get showNext(): boolean {
    return Math.round(this.position) < this.meta.overflowWidth;
  }

  get showPrev(): boolean {
    return this.position >= 100;
  }

  ngOnInit() {
    setTimeout(() => {
      const track = this.trackElement?.nativeElement;
      if (track?.shadowRoot) {
        track.shadowRoot.addEventListener("slotchange", () => {
          track.moveTo(0, "none");
        });
      }
    });
  }

  handleScroll() {
    const track = this.trackElement?.nativeElement;
    if (track) {
      this.position = track.position.x || 0;
    }
  }

  handleChange() {
    const track = this.trackElement?.nativeElement;
    if (track) {
      this.current = track.currentItem || 0;
    }
  }

  handleFormat() {
    const track = this.trackElement?.nativeElement;
    if (track) {
      this.position = track.position.x || 0;
      this.meta = {
        itemCount: track.children.length || 0,
        width: track.trackWidth || 0,
        overflowWidth: track.overflowWidth || 0,
      };
    }
  }

  prev() {
    this.trackElement?.nativeElement?.moveBy(-1);
  }

  next() {
    this.trackElement?.nativeElement?.moveBy(1);
  }

  getContainerClass() {
    return twMerge("@container group/slider relative w-full", this.class);
  }

  getProgressClass() {
    return twMerge(
      "relative flex h-[2px] @lg:w-[400px] w-[200px] items-center bg-[rgba(0,0,0,30%)] drak:bg-[rgba(255,255,255,30%)]",
      this.meta.overflowWidth > 0 ? "opacity-100" : "opacity-0",
    );
  }

  getProgressBarClass() {
    return [
      "-top-[1px] absolute left-[calc(var(--value)*100%-var(--value)*75px)] h-[4px] w-[75px]",
      "rounded-md bg-black transition-none",
    ].join(" ");
  }
}

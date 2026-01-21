import { Component, Input, type OnInit, type OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { twMerge } from "tailwind-merge";
import "@sv/svg-sprites/svg-icon";

const SHOW_THRESHOLD_SCREEN_HEIGHTS = 3;

@Component({
  selector: "fra-back-to-top",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full fixed right-0 bottom-element-l mq4:bottom-10 left-0">
      <button
        (click)="onButtonClicked()"
        [class]="getButtonClass()"
      >
        <svg-icon name="arrow-up"></svg-icon>
        <span class="sr-only">Go to the top of the page</span>
      </button>
    </div>
  `,
})
export class BackToTop implements OnInit, OnDestroy {
  @Input() visible = false;

  showButton = false;

  ngOnInit() {
    window.addEventListener("scroll", this.updateVisibilityConditions);
    window.addEventListener("resize", this.updateVisibilityConditions);
    this.updateVisibilityConditions();
  }

  ngOnDestroy() {
    window.removeEventListener("scroll", this.updateVisibilityConditions);
    window.removeEventListener("resize", this.updateVisibilityConditions);
  }

  updateVisibilityConditions = () => {
    const scrolledScreenHeights = window.scrollY / window.innerHeight;
    this.showButton = scrolledScreenHeights > SHOW_THRESHOLD_SCREEN_HEIGHTS;
  };

  onButtonClicked() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  getButtonClass() {
    return twMerge(
      this.showButton || this.visible ? "opacity-100" : "pointer-events-none opacity-0",
      "absolute mq2:right-3 mq4:right-[44px] right-[128px] bottom-0 transition-opacity ease-linear",
      "flex h-10 w-10 items-center justify-center rounded-md shadow-2xl",
      "hover:text-white active:text-white",
      "bg-blue-50 hover:bg-blue-400 active:bg-blue-200",
      "text-2xl",
    );
  }
}

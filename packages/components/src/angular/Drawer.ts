import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  type ElementRef,
  type OnInit,
  type AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Button } from "./Button.js";
import { Icon } from "./Icon.js";
import { Track, type InputState, type Easing, type Trait } from "@sv/elements/track";

@Component({
  selector: "fra-drawer",
  standalone: true,
  imports: [CommonModule, Button, Icon],
  template: `
    <div class="drawer group/blur -translate-x-1/2 pointer-events-none fixed top-0 left-1/2 z-50 block h-full w-full max-w-[700px] overflow-hidden transition-all">
      <drawer-track
        #drawerElement
        [attr.contentheight]="dynamicHeight ? drawerHeight : null"
        class="block h-full w-full translate-y-0 touch-none transition-all"
        (open)="handleOpen()"
        (close)="handleClose()"
        (move)="handleMove($event)"
        (format)="handleFormat($event)"
      >
        <div class="h-[calc(100vh)] w-full"></div>

        <div class="pointer-events-auto relative rounded-t-lg bg-zinc-50">
          <div class="flex w-full justify-center py-3">
            <div *ngIf="!disabled" class="h-[3px] w-[50px] rounded-3xl bg-zinc-200"></div>
          </div>

          <div
            #scrollContainer
            data-scroll-container
            [class]="getScrollContainerClass()"
          >
            <div #contentContainer>
              <ng-content></ng-content>
            </div>
          </div>

          <fra-button
            *ngIf="!isOpen || disabled"
            variant="ghost"
            class="absolute top-3 right-3 h-auto w-auto text-xs"
            (clicked)="handleCloseClick()"
          >
            <fra-icon name="close"></fra-icon>
          </fra-button>
        </div>
      </drawer-track>
    </div>
  `,
})
export class Drawer implements OnInit, AfterViewInit {
  @Input() disabled?: boolean;
  @Input() dynamicHeight?: boolean;
  @Input() open?: boolean;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() collapseEvent = new EventEmitter<void>();
  @Output() openEvent = new EventEmitter<void>();

  @ViewChild("drawerElement") drawerElement?: ElementRef<DrawerTrack>;
  @ViewChild("scrollContainer") scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild("contentContainer") contentContainer?: ElementRef<HTMLDivElement>;

  isOpen = false;
  drawerHeight?: number;

  ngOnInit() {
    if (this.open === true) {
      this.isOpen = true;
    }
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      if (this.contentContainer) {
        this.drawerHeight = this.contentContainer.nativeElement.offsetHeight;
      }

      setTimeout(() => {
        this.drawerElement?.nativeElement?.minimize();
      });
    });
  }

  handleOpen() {
    this.isOpen = true;
    this.openEvent.emit();
  }

  handleClose() {
    this.isOpen = false;
    this.scrollContainer?.nativeElement?.scrollTo(0, 0);
    this.collapseEvent.emit();
  }

  handleMove(e: Event) {
    if (this.disabled) {
      e.preventDefault();
    }
    if (
      this.scrollContainer?.nativeElement &&
      this.scrollContainer.nativeElement.scrollTop > 10 &&
      this.isOpen === true
    ) {
      e.preventDefault();
    }
  }

  handleFormat(e: Event) {
    e.preventDefault();
  }

  handleCloseClick() {
    this.drawerElement?.nativeElement?.close();

    setTimeout(() => {
      this.closeEvent.emit();
    }, 16);
  }

  getScrollContainerClass() {
    const classes = [
      "h-[calc(100vh-env(safe-area-inset-top))] touch-auto",
      this.isOpen ? "overflow-auto" : "overflow-hidden",
    ];
    return classes.join(" ");
  }
}

export class DrawerTrack extends Track {
  public traits: Trait[] = [
    {
      id: "drawer",
      input(track: DrawerTrack, inputState: InputState) {
        const openThresholdFixed = window.innerHeight / 2;
        const openThreshold = window.innerHeight - openThresholdFixed;

        if (track.position.y > openThreshold && !track.isOpen) {
          track.setOpen(true);
        }
        if (track.position.y < openThreshold && track.isOpen) {
          track.setOpen(false);
        }

        if (track.grabbing || track.target) return;
        if (track.deltaVelocity.y >= 0) return;
        if (track.isStatic) return;

        const vel = Math.round(track.velocity[track.currentAxis] * 10) / 10;
        const power = Math.round(vel / 15);

        if (power < 0) {
          track.minimize();
        } else if (power > 0) {
          track.open();
        } else {
          if (track.position.y > 400) {
            track.open();
          } else if (track.position.y > 40) {
            track.minimize();
          } else {
            track.close();
          }
        }
      },
    },
  ];

  transitionTime = 350;
  drag = 0.98;
  isOpen = false;

  contentheight?: number;

  get isStatic() {
    return !!this.contentheight;
  }

  constructor() {
    super();
    this.vertical = true;
  }

  static get properties() {
    return {
      ...Track.properties,
      contentheight: { type: Number, reflect: true },
    };
  }

  setOpen(value: boolean) {
    this.isOpen = value;

    if (value === true) {
      this.dispatchEvent(new Event("open", { bubbles: true }));
    } else {
      this.dispatchEvent(new Event("close", { bubbles: true }));
    }
  }

  open(ease: Easing = "linear") {
    this.acceleration.mul(0.25);
    this.inputForce.mul(0.125);
    this.setTarget(this.getToItemPosition(1), ease);
  }

  minimize(ease: Easing = "linear") {
    let height = 200;
    if (this.isStatic) {
      const value = this.getAttribute("contentheight");
      const valueInt = value ? +value : Number.NaN;
      const openedPosition = this.getToItemPosition(1);
      height = valueInt > openedPosition.y ? openedPosition.y : valueInt;
    }

    this.acceleration.mul(0.25);
    this.inputForce.mul(0.125);
    this.setTarget([0, height], ease);
  }

  close(ease: Easing = "linear") {
    this.acceleration.mul(0.25);
    this.inputForce.mul(0.125);
    this.setTarget([0, 30], ease);
  }
}

customElements.define("drawer-track", DrawerTrack);

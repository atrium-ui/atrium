import { html } from "lit";
import { css, LitElement, nothing } from "lit";
import { state } from "lit/decorators.js";
import type { Track } from "@sv/elements/track";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

class FraCarouselElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        --pager-margin: 1rem;
        --track-height: auto;
        --radius-xs: 0.375rem;
        --style-fill-blue-default: #000091;
      }
      ::slotted(*) {
        flex: none;
        padding-right: 1rem !important;
      }
      .flex {
        display: flex;
      }
      .justify-center {
        justify-content: center;
      }
      .mt-pager {
        margin-top: var(--pager-margin);
      }
      .gap-2px {
        gap: 2px;
      }
      .list {
        margin: 0;
        list-style: none;
        padding: 0;
      }
      .btn-group {
        display: block;
        border-radius: var(--radius-xs);
        padding: 0.25rem; /* p-element-2xs approximation */
        background: none;
        border: none;
        cursor: pointer;
      }
      .btn-group:focus {
        outline: 2px solid var(--style-fill-blue-default);
        outline-offset: 2px;
      }
      .dot {
        width: 1rem;
        height: 1rem;
        border-radius: var(--radius-xs);
        background: var(--style-fill-blue-default);
        opacity: 0.2;
        transition: opacity 0.2s;
        pointer-events: none;
      }
      .btn-group[aria-selected="true"] .dot {
        opacity: 1;
      }
      .btn-group:hover .dot {
        opacity: 0.3;
      }
      .track {
        display: flex;
        overflow: visible;
        margin-right: calc(var(--gap) * -1);
        height: var(--track-height);
      }
      .item-spacer {
        width: var(--item-width);
        flex: none;
      }
      .item-spacer.hidden {
        display: none;
      }
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        width: 10rem;
        padding: 0.5rem 1rem;
      }
      input[type="range"]::-moz-range-track {
        border-radius: var(--radius-xs);
        background: #00009133;
        height: 0.375rem;
      }
      input[type="range"]::-webkit-slider-runnable-track {
        border-radius: var(--radius-xs);
        background: #00009133;
        height: 0.375rem;
      }
      input[type="range"]::-moz-range-thumb {
         -webkit-appearance: none;
         appearance: none;
         background: var(--style-fill-blue-default);
         height: 0.375rem;
         width: 1.25rem;
         border-radius: var(--radius-xs);
         border: none;
      }
      input[type="range"]::-webkit-slider-thumb {
         -webkit-appearance: none;
         appearance: none;
         background: var(--style-fill-blue-default);
         height: 0.375rem;
         width: 1.25rem;
         border-radius: var(--radius-xs);
      }
    `,
  ];

  private trackRef: Ref<Track> = createRef();

  @state() private itemsPerPage = 1;
  @state() private currentPage = 0;
  @state() private itemCount = 0;
  @state() private pageCount = 0;
  @state() private trackOverflowwidth = 0;
  @state() private trackPosition = 0;

  setPage(pageIndex: number) {
    this.trackRef.value?.moveTo(pageIndex * this.itemsPerPage);
  }

  private onFormat = (event: CustomEvent) => {
    const track = event.currentTarget as Track;
    const itemCount = track.itemCount - 2; // the last 2 items are spacer

    let itemsPerPage = 1;

    let accumulate = 0;
    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      // @ts-ignore
      const width = track.itemWidths[itemIndex];
      // @ts-ignore
      accumulate += width;

      if (accumulate > track.width + 10) {
        // Count item to current page, also if its only 10 pixels over
        break;
      }

      itemsPerPage = itemIndex + 1;
    }

    const pageCount = Math.ceil(itemCount / itemsPerPage);

    this.itemsPerPage = itemsPerPage;
    this.itemCount = itemCount;
    this.pageCount = pageCount;
    this.trackOverflowwidth = track.overflowWidth;
  };

  private onScroll = (event: CustomEvent) => {
    const track = event.currentTarget as Track;
    const currentItem = track.currentItem;
    const currentPage = Math.floor(currentItem / this.itemsPerPage);
    this.currentPage = currentPage;
    this.trackPosition = track.position.x;
  };

  private onScrollerInput = (event) => {
    const percentage = Number.parseFloat((event.target as HTMLInputElement).value);
    const item = Math.round(percentage * this.itemCount);
    this.trackRef.value?.moveTo(item);
  };

  private touchDownStart = 0;

  renderPager() {
    if (this.pageCount > 6) {
      return html`
        <div class="flex justify-center mt-pager">
          <input
            tabindex="-1"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${this.trackPosition / this.trackOverflowwidth}
            @input=${this.onScrollerInput}
          />
        </div>
      `;
    }

    return this.itemCount > this.itemsPerPage
      ? html`
        <ul class="flex justify-center gap-2px list mt-pager">
          ${new Array(this.pageCount).fill(1).map((_, index) => {
            return html`
              <li>
                <button
                  tabindex=${"-1" /* we ignore these since we can tab through the items (teaser) */}
                  class="btn-group"
                  aria-label=${`#${index + 1}`}
                  aria-selected=${index === this.currentPage ? "true" : nothing}
                  @click=${() => this.setPage(index)}
                >
                  <div class="dot"></div>
                </button>
              </li>
            `;
          })}
        </ul>
      `
      : nothing;
  }

  render() {
    const rest = this.itemCount % this.itemsPerPage;
    const overflow = rest > 0 ? this.itemsPerPage - rest : 0;

    return html`
      <a-track
        snap
        class="track"
        style=${`--item-width: ${(1 / this.itemsPerPage) * 100}%`}
        @format=${this.onFormat}
        @scroll=${this.onScroll}
        ${ref(this.trackRef)}
      >
        <slot></slot>
        <div class="item-spacer${(overflow === 1 || overflow === 2) && overflow > 0 ? "" : " hidden"}"></div>
        <div class="item-spacer${overflow === 2 && overflow > 0 ? "" : " hidden"}"></div>
      </a-track>
      <div
        @touchstart=${(e) => {
          this.touchDownStart = e.touches[0].clientX;
        }}
        @touchmove=${(e) => {
          e.preventDefault();

          const delta = e.touches[0].clientX - this.touchDownStart;
          this.touchDownStart += delta / 5;

          // 24px is min gap between interactable elements
          if (Math.abs(delta) > 24) {
            this.setPage(this.currentPage + Math.sign(delta));
          }
        }}
      >
        ${this.renderPager()}
      </div>
    `;
  }
}

if (!customElements.get("fra-carousel")) {
  customElements.define("fra-carousel", FraCarouselElement);
}

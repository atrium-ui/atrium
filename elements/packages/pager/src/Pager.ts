import { HTMLTemplateResult, LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('a-pager')
export class Pager extends LitElement {
	public static styles = css`
    .pagination {
      display: flex;
      justify-content: center;
    }

    .pagination__spacer {
      opacity: 0.5;
      pointer-events: none;
      user-select: none;
    }

    .pagination__item {
      display: inline-block;
      padding: 0 8px;
      margin: 0 2px;
      opacity: 0.5;
      cursor: pointer;
      user-select: none;
      transition: font-weight 0.2s ease, transform 0.33s ease-out;
    }

    .pagination__item:hover {
      opacity: 0.75;
    }

    .pagination__item:active {
    }

    .pagination__item[active="true"] {
      font-weight: 600;
      opacity: 1;
    }

    .pagination__arrow {
      cursor: pointer;
      margin: 0 20px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease;
    }

    .pagination__arrow:focus,
    .pagination__arrow:hover {
    }

    .pagination__arrow:active {
    }

    .pagination__arrow--shown {
      opacity: 1;
      pointer-events: all;
    }

    button {
      all: unset;
    }
  `;

	@property({ type: Number, reflect: true })
	public count = 1;

	@property({ type: Number, reflect: true })
	public current = 1;

	pagerChunkSize = 4;

	lastPageIndex() {
		return this.count - 1;
	}

	currentPageIndex() {
		return +this.current - 1;
	}

	pagerChunk() {
		return Math.max(0, Math.floor(this.current / this.pagerChunkSize));
	}

	pagesToShow() {
		const pages: number[] = [];
		const firstPage = this.pagerChunk() * this.pagerChunkSize;

		for (let p = -2; p < this.pagerChunkSize; p++) {
			const page = firstPage + p;

			if (page >= 0 && page <= this.lastPageIndex()) {
				pages.push(page);
			}
		}

		return pages;
	}

	showPrefix() {
		return this.pagerChunk() > 0;
	}

	showSuffix() {
		const pages = Math.floor(this.lastPageIndex() / this.pagerChunkSize);
		return this.pagerChunk() < pages;
	}

	prevPage() {
		const page = Math.max(1, +this.current - 1);
		this.dispatchEvent(new CustomEvent('page-change', { detail: page }));
		this.requestUpdate();
	}

	nextPage() {
		const page = Math.min(+this.current + 1, +this.count);
		this.dispatchEvent(new CustomEvent('page-change', { detail: page }));
		this.requestUpdate();
	}

	goToPage(index) {
		const page = index + 1;
		this.dispatchEvent(new CustomEvent('page-change', { detail: page }));
		this.requestUpdate();
	}

	protected render(): HTMLTemplateResult {
		return html`
      <div class="pagination c4">
        <button
          class=${`pagination__arrow ${+this.current > 1 ? 'pagination__arrow--shown' : ''}`}
          @click=${() => this.prevPage()}
        >
          <slot name="arrow-left"> < </slot>
        </button>

        <div class="pagination__pages">
          ${
						this.showPrefix()
							? html`
                <span class="pagination__item" @click=${() => this.goToPage(0)}> 1 </span>
                <span class="pagination__spacer"> ... </span>
              `
							: null
					}
          ${this.pagesToShow().map((page) => {
						return html`
              <span
                class="pagination__item"
                active=${page === this.currentPageIndex()}
                @click=${() => this.goToPage(page)}
                >${page + 1}
              </span>
            `;
					})}
          ${
						this.showSuffix()
							? html`
                <span class="pagination__spacer"> ... </span>
                <span
                  class="pagination__item"
                  @click=${() => this.goToPage(this.lastPageIndex())}
                >
                  ${this.count}
                </span>
              `
							: null
					}
        </div>

        <button
          class=${`pagination__arrow ${
						+this.current < +this.count ? 'pagination__arrow--shown' : ''
					}`}
          @click=${() => this.nextPage()}
        >
          <slot name="arrow-right"> > </slot>
        </button>
      </div>
    `;
	}
}

import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-pager": PagerElement;
  }
}

/**
 * A headless pagination element. Manages page state and renders numbered page
 * links. Accepts slotted prev/next controls — clicks on them are intercepted
 * to fire `change` events so the host can update the `page` attribute.
 *
 * @customEvent change - Fired when navigating to a page.
 *   `detail: { page: number, url: string }`. Cancelable.
 *
 * @slot prev - Previous-page control. Any click inside fires a `change` event.
 * @slot next - Next-page control. Any click inside fires a `change` event.
 *
 * @attr {number} page  - Current page (1-indexed). Reflected.
 * @attr {number} count - Total number of pages. Reflected.
 * @attr {string} url   - URL template with `{page}` placeholder, e.g. `/items/{page}`.
 *                        Falls back to appending `?page=N` to the current URL.
 * @attr {string} query - Additional query params appended to every page URL.
 * @attr at-start       - Present when on the first page. Use to disable/hide the prev control.
 * @attr at-end         - Present when on the last page. Use to disable/hide the next control.
 *
 * Styling page numbers via CSS shadow parts:
 * ```css
 * a-pager::part(page)        { padding: 0.25rem 0.5rem; border: 1px solid #ccc; }
 * a-pager::part(page active) { background: #0060df; color: #fff; }
 * a-pager::part(ellipsis)    { color: #999; }
 * ```
 *
 * Disabling boundary controls:
 * ```css
 * a-pager[at-start] [slot="prev"],
 * a-pager[at-end]   [slot="next"] { opacity: 0.4; pointer-events: none; }
 * ```
 *
 * @example
 * ```html
 * <a-pager page="3" count="10" url="/results/{page}">
 *   <button slot="prev">← Prev</button>
 *   <button slot="next">Next →</button>
 * </a-pager>
 * ```
 */
export class PagerElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    a {
      color: inherit;
      text-decoration: none;
    }
  `;

  /** Current page (1-indexed). */
  @property({ type: Number, reflect: true })
  page = 1;

  /** Total number of pages. */
  @property({ type: Number, reflect: true })
  count = 1;

  /**
   * URL template with `{page}` placeholder.
   * Falls back to `?page=N` on the current URL.
   */
  @property({ type: String })
  url?: string;

  /** Additional query string params appended to every generated page URL. */
  @property({ type: String })
  query?: string;

  @state()
  chunkSize = 3;

  get currentPage() {
    return +this.page;
  }

  get pageCount() {
    return +this.count;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.onHostClick);
    window.addEventListener("resize", this.onResize);
    this.onResize();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this.onHostClick);
    window.removeEventListener("resize", this.onResize);
  }

  protected willUpdate(): void {
    this.toggleAttribute("at-start", this.currentPage <= 1);
    this.toggleAttribute("at-end", this.currentPage >= this.pageCount);
  }

  onResize = () => {
    this.chunkSize = window.innerWidth < 500 ? 1 : 3;
  };

  /**
   * Intercepts clicks on slotted prev/next elements and fires `change` events.
   * Uses composedPath so clicks on children of the slotted element are caught too.
   */
  onHostClick = (e: MouseEvent) => {
    const target = e.composedPath()[0];
    if (!(target instanceof Element)) return;

    const isInSlot = (name: string): boolean => {
      const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(
        `slot[name="${name}"]`,
      );
      return (
        slot
          ?.assignedElements({ flatten: true })
          .some((el) => el === target || el.contains(target)) ?? false
      );
    };

    if (isInSlot("prev")) {
      e.preventDefault();
      if (this.currentPage > 1) this.dispatchChange(e, this.currentPage - 1);
    } else if (isInSlot("next")) {
      e.preventDefault();
      if (this.currentPage < this.pageCount) this.dispatchChange(e, this.currentPage + 1);
    }
  };

  dispatchChange(userEvent: Event | null, page: number): void {
    const event = new CustomEvent("change", {
      cancelable: true,
      bubbles: true,
      detail: { page, url: this.pageUrl(page) },
    });
    const dispatched = this.dispatchEvent(event);
    if (!dispatched) userEvent?.preventDefault();
  }

  pageUrl(page: number): string {
    if (this.url) {
      const base = this.url.replace("{page}", String(page));
      if (!this.query) return base;
      return `${base}${base.includes("?") ? "&" : "?"}${this.query}`;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    if (this.query) {
      for (const [k, v] of new URLSearchParams(this.query)) params.set(k, v);
    }
    return `?${params.toString()}`;
  }

  pageIndices(): number[] {
    const half = Math.floor(this.chunkSize / 2);
    let lo = this.currentPage - half;
    let hi = this.currentPage + half;
    if (lo < 1) {
      hi = Math.min(hi + (1 - lo), this.pageCount);
      lo = 1;
    }
    if (hi > this.pageCount) {
      lo = Math.max(1, lo - (hi - this.pageCount));
      hi = this.pageCount;
    }
    const pages: number[] = [];
    for (let p = lo; p <= hi; p++) pages.push(p);
    return pages;
  }

  renderPageLink(page: number): TemplateResult {
    const active = page === this.currentPage;
    return html`<a
      href=${this.pageUrl(page)}
      @click=${(e: Event) => this.dispatchChange(e, page)}
      part=${active ? "page active" : "page"}
      aria-current=${active ? "page" : nothing}
      aria-label="Page ${page}"
    >${page}</a>`;
  }

  renderPages(): TemplateResult[] {
    if (this.pageCount <= this.chunkSize + 1) {
      return Array.from({ length: this.pageCount }, (_, i) => this.renderPageLink(i + 1));
    }

    const indices = this.pageIndices();
    const first = indices[0];
    const last = indices[indices.length - 1];
    const items: TemplateResult[] = [];

    if (first > 1) items.push(this.renderPageLink(1));
    if (first === 3) items.push(this.renderPageLink(2));
    if (first > 3) items.push(html`<span part="ellipsis" aria-hidden="true">…</span>`);

    items.push(...indices.map((p) => this.renderPageLink(p)));

    if (this.pageCount - last > 2)
      items.push(html`<span part="ellipsis" aria-hidden="true">…</span>`);
    if (this.pageCount - last === 2) items.push(this.renderPageLink(this.pageCount - 1));
    if (last < this.pageCount) items.push(this.renderPageLink(this.pageCount));

    return items;
  }

  render(): TemplateResult {
    return html`
      <slot name="prev"></slot>
      <nav part="pages" aria-label="Pagination">
        ${this.renderPages()}
      </nav>
      <slot name="next"></slot>
    `;
  }
}

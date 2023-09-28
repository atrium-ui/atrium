import { HTMLTemplateResult, LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

declare global {
  interface HTMLElementTagNameMap {
    'a-blur': Blur;
  }
}

@customElement('a-blur')
export class Blur extends LitElement {
  public static styles = css`
    :host {
      display: block;
      transition-property: all;
      pointer-events: none;
    }

    :host([enabled]) {
      pointer-events: all;
    }
  `;

  @property({ type: Boolean, reflect: true })
  public enabled = false;

  @query('slot')
  slot;

  protected updated(): void {
    if (this.enabled) {
      document.body.style.overflow = 'hidden';
      this.setAttribute('aria-hidden', 'true');
    } else {
      document.body.style.overflow = '';
      this.setAttribute('aria-hidden', 'false');
    }
  }

  shouldBlur(e: MouseEvent) {
    if (e.target === this && this.contains(e.target as HTMLElement)) {
      return this.enabled;
    }
    return false;
  }

  handleClick = (e: MouseEvent) => {
    if (this.shouldBlur(e)) {
      this.dispatchEvent(new Event('blur'));
      this.enabled = false;
    }
  };

  proxyScroll = (e: Event) => {
    if (this.enabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      window.scrollTo(scrollLeft, scrollTop);
    }
  };

  connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener('click', this.handleClick);
    window.addEventListener('scroll', this.proxyScroll);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    window.removeEventListener('scroll', this.proxyScroll);
  }

  render(): HTMLTemplateResult {
    return html`<slot></slot>`;
  }
}

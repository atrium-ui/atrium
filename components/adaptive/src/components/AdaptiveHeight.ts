import { html, css, HTMLTemplateResult, LitElement } from "lit";
import { query } from "lit/decorators.js";

export class AdaptiveHeight extends LitElement {
  public static get styles() {
    return [
      css`
        :host {
          display: block;

          --transition-speed: 0.33s;
          --animation-easing: ease;
        }

        .container {
          display: block;
          overflow: visible;
          transition: height var(--transition-speed) var(--animation-easing);
        }

        .content {
          display: block;
        }
      `,
    ];
  }

  constructor() {
    super();

    const observer = new MutationObserver(() => {
      this.requestUpdate();
    });

    observer.observe(this, { subtree: true, childList: true });
  }

  @query("slot")
  content!: HTMLElement;

  protected render(): HTMLTemplateResult {
    const h = this.content?.offsetHeight || "auto";
    // use FLIP here
    return html`
      <div class="container" style=${`height: ${h}px`}>
        <slot class="content"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sv-adaptive-height": AdaptiveHeight;
  }
}

customElements.define("sv-adaptive-height", AdaptiveHeight);

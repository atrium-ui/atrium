import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("sv-accordion-item")
export class AccordionItem extends LitElement {
  public static get styles() {
    return [
      css`
        :host {
          display: block;

          --accordion-transition-duration-scale: 1;
        }

        .accordion-title {
          cursor: pointer;
        }

        .item-outer-content {
          --accordion-item-height: 0;
          --accordion-content-height: 0;
          --accordion-transition-duration: calc((var(--accordion-content-height)) * 0.001s);

          height: calc(var(--accordion-item-height) * 1px);
          transition: height
            calc(var(--accordion-transition-duration) * var(--accordion-transition-duration-scale))
            ease;
          position: relative;
          overflow: hidden;
          background: white;
        }

        .item-content {
          position: absolute;
        }

        .headline {
          display: flex;
          justify-content: space-between;
          font-size: 1.2rem;
          transition: background 0.2s ease-out;
        }

        .headline:active {
          transition: none;
        }
      `,
    ];
  }

  @property({ type: Boolean, reflect: true })
  public opened?: boolean;

  @property({ type: String })
  public headline?: string;

  private onItemClick(): void {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
    this.dispatchEvent(new Event("item-opened-change", { bubbles: true }));
  }

  public close() {
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }

  protected render() {
    return html`
      <div class="accordion-title" @click="${this.onItemClick.bind(this)}">
        <slot id="title-element" name="title">
          <div class="headline">
            <span>${this.headline}</span>
          </div>
        </slot>
      </div>

      <sv-collapsable ?opened="${this.opened}">
        <slot></slot>
      </sv-collapsable>
    `;
  }
}

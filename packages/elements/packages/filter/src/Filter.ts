import { type HTMLTemplateResult, LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-command": Filter;
  }
}

@customElement("a-filter")
export class Filter extends LitElement {
  public static styles = css`
    :host {
      display: block;
      z-index: 1000;
      backdrop-filter: blur(12px) brightness(0.9);
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid #3333330f;
      border-radius: 6px;
      width: 600px;
      max-width: 80vw;
      padding: 3px;
    }

    .input {
      display: flex;
      align-items: center;
      background: #3333330f;
      border-radius: 4px;
      padding: 10px 12px;
      width: 100%;
      box-sizing: border-box;
    }

    input {
      all: unset;
      flex: 1;
      width: 100%;
      line-height: 100%;
    }

    .results {
      max-width: 100%;
      box-sizing: border-box;
      max-height: 300px;
      overflow-y: auto;
    }
  `;

  @property({ type: String })
  public placeholder?: string;

  @query('slot[name="input"]')
  private input?: HTMLSlotElement;

  @query(".items")
  private items;

  current = 0;

  public enter() {
    const children = this.items.assignedElements();
    const child = children[this.current];
    if (child) {
      child.click();
    }
  }

  public up() {
    this.current--;
  }

  public down() {
    this.current++;
  }

  private onBlur() {
    setTimeout(() => {
      this.dispatchEvent(new Event("blur"));
    }, 150);
  }

  private onInput = (e) => {
    this.dispatchEvent(new CustomEvent("input", { detail: e.target.value }));
  };

  private onKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        this.down();
        e.preventDefault();
        break;
      case "ArrowUp":
        this.up();
        e.preventDefault();
        break;
      case "Enter":
        this.enter();
        e.preventDefault();
        break;
      default:
        this.current = 0;
    }
    this.requestUpdate();
  };

  private onPointerEnter = (e) => {
    const children = this.items.assignedElements();
    const index = children.indexOf(e.target);
    if (index >= 0) {
      this.current = index;
      this.requestUpdate();
    }
  };

  protected updated(): void {
    const children = this.items.assignedElements();

    if (this.current < 0) this.current = children.length - 1;
    if (this.current >= children.length) this.current = 0;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (i === this.current) {
        child.setAttribute("selected", "");
        child.scrollIntoView({ block: "nearest" });
      } else {
        child.removeAttribute("selected");
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener("pointerenter", this.onPointerEnter, { capture: true });
    this.addEventListener("blur", this.onBlur, { capture: true });
  }

  protected firstUpdated(): void {
    this.input?.addEventListener("keydown", this.onKeyDown, { capture: true });
    this.input?.addEventListener("input", this.onInput, { capture: true });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeEventListener("pointerenter", this.onPointerEnter, { capture: true });
    this.removeEventListener("blur", this.onBlur, { capture: true });

    this.input?.removeEventListener("keydown", this.onKeyDown, { capture: true });
    this.input?.removeEventListener("input", this.onInput, { capture: true });
  }

  protected render(): HTMLTemplateResult {
    return html`
      <div class="input">
        <slot name="before-input"></slot>
        <slot name="input">
          <input placeholder=${this.placeholder || ""} type="text" />
        </slot>
        <slot name="after-input"></slot>
      </div>

      <div class="results">
        <slot class="items"></slot>
      </div>
    `;
  }
}

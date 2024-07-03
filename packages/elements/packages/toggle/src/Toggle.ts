import { type HTMLTemplateResult, LitElement, css, html } from "lit";
import { query } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-toggle": ToggleElement;
  }
}

/**
 * - Inherits the size of its child
 * - Automatically reacts to changes in the child’s size
 * - Animated by default
 *
 * @see https://sv.pages.s-v.de/sv-frontend-library/mono/elements/a-adaptive/
 */
export class ToggleElement extends LitElement {
  public static get styles() {
    return [
      css`
        :host {
          display: block;
        }
        .content {
          display: inherit;
        }
      `,
    ];
  }

  observer!: MutationObserver;

  connectedCallback() {
    super.connectedCallback();

    if (typeof MutationObserver !== "undefined") {
      this.observer = new MutationObserver((cahgnes) => {
        this.requestUpdate();
      });
      this.observer.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    }

    window.addEventListener("resize", this.onResize);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("resize", this.onResize);

    if (this.observer) this.observer.disconnect();
  }

  onResize = () => {
    this.lastHeight = this.content?.offsetHeight;
    this.lastWidth = this.content?.offsetWidth;
  };

  @query("slot")
  content!: HTMLElement;

  lastHeight = this.offsetHeight;
  lastWidth = this.offsetWidth;

  initial = false;

  async updated() {
    const height = this.offsetHeight;
    const width = this.offsetWidth;

    if (!this.initial) {
      this.initial = true;
      this.lastHeight = height;
      this.lastWidth = width;
      return;
    }

    if (height && width) {
      await this.animate(
        [
          {
            height: `${this.lastHeight}px`,
            width: `${this.lastWidth}px`,
          },
          {
            height: `${height}px`,
            width: `${width}px`,
          },
        ],
        {
          duration: 200,
          easing: "ease-out",
        },
      ).finished;
    }

    this.lastHeight = height;
    this.lastWidth = width;
  }

  protected render(): HTMLTemplateResult {
    return html`
      <slot class="content">
        <span>X</span>
      </slot>
    `;
  }
}

customElements.define("a-toggle", ToggleElement);

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals
// https://web.dev/articles/more-capable-form-controls
// https://developer.mozilla.org/en-US/docs/Web/API/FormDataEvent

export class SimpleElement extends LitElement {
  static styles = css`p { color: blue }`;

  static formAssociated = true;

  private _internals: ElementInternals | undefined;

  public get form() {
    if (this._internals) {
      return this._internals.form;
    }

    let child = this.parentElement;
    while (child) {
      if (child.nodeName === "FORM") {
        return child;
      }
      child = this.parentElement;
    }

    return undefined;
  }

  constructor() {
    super();
    this._internals = this.attachInternals?.();
  }

  _value = 123;

  connectedCallback() {
    super.connectedCallback();

    if (!this._internals) {
      // a little higher support range
      this.form?.addEventListener("formdata", (e) => {
        e.formData.set("field1", this._value.toString());
      });
    } else {
      this._internals?.setFormValue(this._value.toString());
    }
  }

  get value() {
    return this._value;
  }

  render() {
    return html`<p>Hello, ${this._value}!</p>`;
  }
}

customElements.define("simple-element", SimpleElement);

export class ModernSimpleElement extends LitElement {
  static styles = css`p { color: blue }`;

  static formAssociated = true;

  private _internals: ElementInternals | undefined;

  public get form() {
    return this._internals?.form;
  }

  constructor() {
    super();
    this._internals = this.attachInternals?.();
  }

  _value = 456;

  connectedCallback() {
    super.connectedCallback();
    this._internals?.setFormValue(this._value.toString());
  }

  get value() {
    return this._value;
  }

  render() {
    return html`<p>Hello, ${this._value}!</p>`;
  }
}

customElements.define("modern-element", ModernSimpleElement);

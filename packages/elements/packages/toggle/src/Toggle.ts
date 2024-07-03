import { LitElement, type PropertyValues, css, html } from "lit";
import { property } from "lit/decorators/property.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-toggle": ToggleElement;
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals
// https://web.dev/articles/more-capable-form-controls
// https://developer.mozilla.org/en-US/docs/Web/API/FormDataEvent

/**
 * A toggle is a button that can be toggled between two states. Also integrates into forms well.
 * - checkboxes
 * - switches
 * - toggle button
 *
 * @customEvent change - When value changed.
 * @customEvent input - When value changed.
 *
 * @example
 * ```html
 * <a-toggle
 *   class="m-1 p-2 leading-none cursor-pointer border hover:border-zinc-600 border-zinc-700 bg-zinc-800 focus:ring-4 [&[value='true']]:bg-zinc-700"
 *   name="true"
 *   value="true"
 * >
 *   <span slot="true">Yes</span>
 *   <span slot="false">No</span>
 * </a-toggle>
 * ```
 *
 * @see https://sv.pages.s-v.de/sv-frontend-library/mono/elements/a-toggle/
 */
export class ToggleElement extends LitElement {
  static formAssociated = true;

  static styles = css`
    :host {
      display: inline-block;

      user-select: none;
      -webkit-user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
    }

    button {
      pointer-events: none;
      appearance: none;
      border: none;
      background: none;
      padding: 0;
      margin: 0;
    }

    button:focus {
      outline: none;
    }
  `;

  /**
   * FormData name of the field.
   */
  @property({ type: String })
  public name?: string;

  /**
   * The value of the field, which is submitted with the form data.
   */
  @property({ type: String, reflect: true })
  public value = "false";

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("value")) {
      if (this._internals) {
        this._internals?.setFormValue(this._value.toString());
      }

      this.dispatchEvent(
        new CustomEvent("change", { detail: this._value, bubbles: true }),
      );
      this.dispatchEvent(
        new CustomEvent("input", { detail: this._value, bubbles: true }),
      );
    }
  }

  /**
   * Toggles the value.
   */
  public toggle() {
    this.value = String(!this._value);
  }

  /**
   * Returns the form associated with the element.
   */
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

  private _internals: ElementInternals | undefined;

  private get _value() {
    if (this.value === "true" || this.value === "on") {
      return true;
    }
    if (this.value === "false") {
      return false;
    }
    return false;
  }

  private onFormData = (e) => {
    if (this.name) {
      e.formData.set(this.name, this._value.toString());
    }
  };

  private onClick = (e) => {
    this.toggle();
  };

  private onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      this.toggle();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("click", this.onClick);
    this.addEventListener("keydown", this.onKeyDown);

    this._internals = this.attachInternals?.();

    if (!this._internals) {
      // a little higher support range
      this.form?.addEventListener("formdata", this.onFormData);
    } else {
      this._internals?.setFormValue(this._value.toString());
    }
  }

  disconnectedCallback(): void {
    this.removeEventListener("click", this.onClick);
    this.removeEventListener("keydown", this.onKeyDown);

    if (!this._internals) {
      this.form?.removeEventListener("formdata", this.onFormData);
    }

    super.disconnectedCallback();
  }

  render() {
    return html`
      <button type="button">
        <slot data-value=${this.value} name=${this._value === true ? "true" : "false"} />
        <slot />
      </button>
    `;
  }
}

customElements.define("a-toggle", ToggleElement);

//
// Using only the form internals api
// export class ModernSimpleElement extends LitElement {
//   static styles = css`p { color: blue }`;

//   static formAssociated = true;

//   private _internals: ElementInternals | undefined;

//   public get form() {
//     return this._internals?.form;
//   }

//   constructor() {
//     super();
//     this._internals = this.attachInternals?.();
//   }

//   _value = 456;

//   connectedCallback() {
//     super.connectedCallback();
//     this._internals?.setFormValue(this._value.toString());
//   }

//   get value() {
//     return this._value;
//   }

//   render() {
//     return html`<p>Hello, ${this._value}!</p>`;
//   }
// }

// customElements.define("a-toggle-form", ModernSimpleElement);

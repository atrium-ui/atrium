import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-form-field": FormFieldElement;
    "a-form-field-error": FormFieldErrorElement;
  }
}

/**
 * A form field can be any single field of a form.
 * It is used to capture changes and validation events of a form field.
 *
 * @example
 * <form>
 *   <a-form-field>
 *     <input name="name" required />
 *   </a-form-field>
 * </form>
 *
 * @see https://atrium-ui.dev/elements/a-form-field/
 */
export class FormFieldElement extends LitElement {
  valid = true;

  @property({ type: Boolean, reflect: true })
  invalid = false;

  setValid(valid: boolean) {
    this.valid = valid;
    this.invalid = !this.valid;
  }

  getInput() {
    return this.querySelector("input, textarea") as
      | HTMLInputElement
      | HTMLTextAreaElement
      | undefined;
  }

  getForm() {
    return this.getInput()?.form;
  }

  connectedCallback() {
    super.connectedCallback();

    this.getForm()?.addEventListener("error", this.handleError as EventListener, true);
    this.getForm()?.addEventListener("reset", this.handleReset as EventListener, true);

    this.addEventListener("invalid", this.onInvalid, { capture: true });
    this.addEventListener("change", this.change, { capture: true });
    this.addEventListener("input", this.input, { capture: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.getForm()?.removeEventListener("error", this.handleError as EventListener, true);
    this.getForm()?.removeEventListener("reset", this.handleReset as EventListener, true);

    this.removeEventListener("invalid", this.onInvalid, { capture: true });
    this.removeEventListener("change", this.change, { capture: true });
    this.removeEventListener("input", this.input, { capture: true });
  }

  onInvalid = (e: Event) => {
    e.preventDefault();
    (e?.target as HTMLInputElement)?.focus();

    this.setValid(false);

    this.dispatchEvent(new CustomEvent("field-state", { detail: this }));
    this.scrollIntoView({ block: "center" });
  };

  change = (e: Event) => {
    this.getInput()?.setCustomValidity("");

    this.setValid((e?.target as HTMLInputElement)?.reportValidity());

    this.dispatchEvent(new CustomEvent("field-state", { detail: this }));
  };

  input = (e: Event) => {
    this.getInput()?.setCustomValidity("");

    this.dispatchEvent(new CustomEvent("field-state", { detail: this }));
  };

  handleError = (e: CustomEvent) => {
    const input = this.getInput();

    if (input && e.detail.name === input.name) {
      input.setCustomValidity(e.detail.message[0]);
      input.focus();
      this.scrollIntoView({ block: "center" });
    }

    this.dispatchEvent(new CustomEvent("field-state", { detail: this }));
  };

  handleReset = (e: CustomEvent) => {
    const input = this.getInput();
    input?.dispatchEvent(new Event("change"));
  };

  render() {
    return html`
      <slot></slot>
    `;
  }
}

/**
 * The form field error element is responseible for displaying validation errors to the user.
 *
 * @example
 * <form>
 *   <a-form-field field="name">
 *
 *     <input name="name" required />
 *     <a-form-field-error />
 *
 *   </a-form-field>
 * </form>
 *
 * @see https://atrium-ui.dev/elements/a-form-field/
 */
export class FormFieldErrorElement extends LitElement {
  static styles = [
    css`
      :host {
        display: none;
      }
    `,
  ];

  @state()
  private _message: string | undefined;

  onState = (e) => {
    const field = e.detail as FormFieldElement;
    const input = field.getInput();

    // TODO: dont overwrite the innerText, put the text in the slot inside the shadowDOM
    if (input && field.valid === false && input.validationMessage) {
      this.style.display = "block";
      this._message = input.validationMessage;
    } else {
      this.style.display = "none";
      this._message = "";
    }
  };

  connectedCallback() {
    super.connectedCallback();
    const formField = this.closest("a-form-field");
    formField?.addEventListener("field-state", this.onState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const formField = this.closest("a-form-field");
    formField?.removeEventListener("field-state", this.onState);
  }

  render() {
    return html`
      <slot>${this._message}</slot>
    `;
  }
}

// Elements

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
 * @see https://svp.pages.s-v.de/atrium/elements/a-form-field/
 */
export class FormFieldElement extends (globalThis.HTMLElement || class {}) {
  valid = true;

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
    this.getForm()?.addEventListener("error", this.handleError as EventListener, true);
    this.getForm()?.addEventListener("reset", this.handleReset as EventListener, true);

    this.addEventListener("invalid", this.invalid, { capture: true });
    this.addEventListener("change", this.change, { capture: true });
    this.addEventListener("input", this.input, { capture: true });
  }

  disconnectedCallback() {
    this.getForm()?.removeEventListener("error", this.handleError as EventListener, true);
    this.getForm()?.removeEventListener("reset", this.handleReset as EventListener, true);

    this.removeEventListener("invalid", this.invalid, { capture: true });
    this.removeEventListener("change", this.change, { capture: true });
    this.removeEventListener("input", this.input, { capture: true });
  }

  invalid = (e: Event) => {
    e.preventDefault();
    (e?.target as HTMLInputElement)?.focus();

    this.valid = false;

    this.dispatchEvent(new CustomEvent("field-state", { detail: this }));
  };

  change = (e: Event) => {
    this.getInput()?.setCustomValidity("");

    this.valid = (e?.target as HTMLInputElement)?.reportValidity();

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
    }

    this.dispatchEvent(new CustomEvent("field-state", { detail: this }));
  };

  handleReset = (e: CustomEvent) => {
    const input = this.getInput();
    input?.dispatchEvent(new Event("change"));
  };
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
 * @see https://svp.pages.s-v.de/atrium/elements/a-form-field/
 */
export class FormFieldErrorElement extends (globalThis.HTMLElement || class {}) {
  onState = (e) => {
    const field = e.detail as FormFieldElement;
    const input = field.getInput();

    if (input && field.valid === false) {
      this.textContent = input.validationMessage;
    } else {
      this.textContent = "";
    }
  };

  connectedCallback() {
    const formField = this.closest("a-form-field");
    formField?.addEventListener("field-state", this.onState);
  }

  disconnectedCallback() {
    const formField = this.closest("a-form-field");
    formField?.removeEventListener("field-state", this.onState);
  }
}

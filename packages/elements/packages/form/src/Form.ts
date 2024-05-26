// Elements

declare global {
  interface HTMLElementTagNameMap {
    "a-form-field": FormFieldElement;
    "a-form-field-error": FormFieldErrorElement;
  }
}

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

    this.addEventListener("invalid", this.invalid, { capture: true });
    this.addEventListener("change", this.input, { capture: true });
    this.addEventListener("input", this.input, { capture: true });
  }

  disconnectedCallback() {
    this.getForm()?.removeEventListener("error", this.handleError as EventListener, true);

    this.removeEventListener("invalid", this.invalid, { capture: true });
    this.removeEventListener("change", this.input, { capture: true });
    this.removeEventListener("input", this.input, { capture: true });
  }

  invalid = (e: Event) => {
    e.preventDefault();
    (e?.target as HTMLInputElement)?.focus();

    this.valid = false;

    this.dispatchEvent(new CustomEvent("field-state", { detail: this }));
  };

  input = (e: Event) => {
    const input = this.getInput();
    input?.setCustomValidity("");

    this.valid = (e?.target as HTMLInputElement)?.reportValidity();

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
}

if (typeof window !== "undefined") {
  customElements.define("a-form-field", FormFieldElement);
  customElements.define("a-form-field-error", FormFieldErrorElement);
}

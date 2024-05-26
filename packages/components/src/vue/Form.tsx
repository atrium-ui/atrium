/* @jsxImportSource vue */
import { Input } from "./Input.jsx";

export function FormField(props: {
  field: {
    type: string;
    description?: string;
    label: string;
    error?: string;
    placeholder: string;
    name: string;
    required?: boolean;
    value: string | boolean;
  };
}) {
  const InputField = (props) => {
    switch (props.type) {
      case "text":
      case "name":
        return <Input {...props} />;
      case "email":
        return <Input type="email" {...props} />;
      case "textarea":
        return <Input multiline {...props} />;
      case "checkbox":
        return <Input type="checkbox" {...props} />;
      case "date":
        return <Input type="date" {...props} />;
      default:
        return <Input {...props} />;
    }
  };

  return (
    <a-form-field>
      <div class={`form-field-${props.field.type}`}>
        <InputField
          {...props.field}
          label={
            !props.field.description
              ? `${props.field.label} ${props.field.required ? "" : "(optional)"}`
              : null
          }
          id={props.field.name}
          class={`form-field-input-${props.field.type}`}
        />

        {props.field.description ? (
          <div class="form-field-description">
            <label for={props.field.name}>{props.field.description}</label>
          </div>
        ) : null}
      </div>

      <div class="text-red-400 text-xs">
        <a-form-field-error />
      </div>
    </a-form-field>
  );
}

// Elements

declare global {
  interface HTMLElementTagNameMap {
    "a-form-field": FormFieldElement;
    "a-form-field-error": FormFieldErrorElement;
  }
}

const HTMLElement = globalThis.HTMLElement || class {};

class FormFieldErrorElement extends HTMLElement {
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

if (typeof window === "object") {
  customElements.define("a-form-field-error", FormFieldErrorElement);
}

class FormFieldElement extends HTMLElement {
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

if (typeof window === "object") {
  customElements.define("a-form-field", FormFieldElement);
}

type FormField = {
  defaultValue: string;
  displayName?: string;
  errorMessage?: string;
  handle: string;
  name: string;
  instructions?: string;
  description?: string;
  placeholder: string;
  typeName: string;
  required?: boolean;
  availableDaysOfWeek?: string;
  minDate?: Date;
  maxDate?: Date;
};

type FormSpec = {
  rows: {
    rowFields: FormField[];
  }[];
  pages: any[];
};

export class FormRenderer {
  defaultFieldTypeMap = {
    Field_Heading: "heading",
    Field_Name: "name",
    Field_Email: "email",
    Field_SingleLineText: "text",
    Field_MultiLineText: "textarea",
    Field_Agree: "checkbox",
    Field_Date: "date",
  };

  /**
   * Maps field type to internal field type
   */
  getFieldType(field: FormField) {
    return this.defaultFieldTypeMap[field.typeName];
  }

  /**
   * Converts field default value to value
   */
  getFieldValue(field: FormField) {
    const type = this.getFieldType(field);

    if (type === "checkbox") {
      return field.defaultValue === "1" || false;
    }

    return field.defaultValue;
  }

  /**
   * Converts field data into useable props for a form field component
   */
  renderField(field: FormField) {
    const type = this.getFieldType(field);
    if (!type) return undefined;

    const alleWochenTage = [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
    ];
    let disabledWeekDays: number[] = [];

    if (field.availableDaysOfWeek) {
      try {
        const arr = JSON.parse(field.availableDaysOfWeek) as string[];
        disabledWeekDays = alleWochenTage
          .filter((item) => !arr.includes(item))
          .map((str) => alleWochenTage.indexOf(str));
      } catch (error) {
        console.error(error);
      }
    }

    return {
      type,
      description: field.description,
      label: field.name,
      error: field.errorMessage,

      placeholder: field.placeholder,
      name: field.handle,
      required: field.required,
      value: this.getFieldValue(field),

      disabledDates: {
        days: disabledWeekDays,
        customPredictor(date) {
          if (field.minDate && date.valueOf() < new Date(field.minDate)) {
            return true;
          }
          if (field.maxDate && date.valueOf() > new Date(field.maxDate)) {
            return true;
          }
          return false;
        },
      },
    };
  }

  renderRow(row: FormSpec["rows"][number]) {
    return row.rowFields.map((field) => this.renderField(field)).filter(Boolean);
  }

  renderRows(rows: FormSpec["rows"]) {
    return rows.map((row) => this.renderRow(row));
  }

  /**
   * Turns a form into fields and turns fields into variables
   */
  variables(formSpec: FormSpec, formData: FormData): [object, object] {
    // TODO: refactor this method
    const fields = {};

    for (const entry of formData.entries()) {
      const [key, value] = entry;
      const field = formSpec.rows
        .find((row) => row.rowFields.find((field) => field.handle === key))
        ?.rowFields.find((field) => field.handle === key);
      fields[key] = {
        ...field,
        value,
      };
    }

    const variables = {};

    for (const key in fields) {
      switch (fields[key].typeName) {
        case "Field_Date":
          variables[key] = new Date(fields[key].value);
          break;
        default:
          variables[key] = fields[key].value;
      }
    }

    return [fields, variables];
  }
}

const css = String.raw;

export class Field extends HTMLElement {
  static get observedAttributes() {
    return ["value", "name"];
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "value") {
      this.value = newValue;
    }
    if (name === "name") {
      this.name = newValue;
    }
  }

  private readonly input = this.createInput();
  private readonly inner = this.createInnerText();

  public set value(value: string) {
    this.inner.innerText = value;
    this.input.value = value;
  }

  public get value() {
    return this.input.value;
  }

  public set name(name: string) {
    this.input.name = name;
  }

  public get name() {
    return this.input.name;
  }

  public set editable(editable: boolean) {
    if (editable) {
      this.setAttribute("editable", "");
    } else {
      this.removeAttribute("editable");
    }
  }

  public get editable() {
    return this.hasAttribute("editable");
  }

  public enable() {
    this.editable = true;

    requestAnimationFrame(() => {
      this.input.focus();
    });
  }

  public disable() {
    this.editable = false;
    window.getSelection()?.empty();
  }

  public reportValidity() {
    return this.input.reportValidity() && this.input.value.length >= this.input.minLength;
  }

  private clickCount = 0;

  constructor() {
    super();

    this.addEventListener("pointerdown", () => {
      if (this.editable) return;

      this.clickCount++;

      if (this.clickCount === 2) {
        this.enable();
      }

      setTimeout(() => {
        this.clickCount = 0;
      }, 400);
    });
  }

  public connectedCallback() {
    this.attach();
  }

  public trySubmit() {
    if (!this.reportValidity()) {
      return false;
    }

    this.setAttribute("value", this.value);
    this.disable();

    this.dispatchEvent(new CustomEvent("change", { detail: this.value, bubbles: true }));

    return true;
  }

  public cancel() {
    const oldValue = this.getAttribute("value");
    if (oldValue) {
      this.value = oldValue;
    }
    this.disable();
  }

  private createInnerText() {
    const text = document.createElement("span");
    text.innerText = this.value;
    return text;
  }

  private createInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.minLength = 2;

    input.addEventListener("input", (ev: Event) => {
      ev.stopPropagation();
    });

    input.addEventListener("change", (ev: Event) => {
      ev.stopPropagation();
    });

    input.addEventListener("keydown", (ev: KeyboardEvent) => {
      this.handleKey(ev) && ev.preventDefault();
    });

    input.addEventListener("focusout", (e: Event) => {
      this.clickCount = 0;

      if (this.editable) {
        this.trySubmit() || this.cancel();
      }
    });

    return input;
  }

  private handleKey(ev: KeyboardEvent) {
    if (ev.key === "Enter") {
      this.trySubmit();
      return true;
    }

    if (ev.key === "Escape") {
      this.cancel();
      return true;
    }

    return false;
  }

  private attach() {
    if (!this.shadowRoot) {
      const shadowRoot = this.attachShadow({ mode: "open" });
      const styles = document.createElement("style");
      styles.innerHTML = css`
        * {
            box-sizing: border-box;
        }

        :host {
            display: inline-block;
        }

        :host([editable]) {
            cursor: text;
        }

        /* text container */
        div {
            position: relative;
        }

        /* inner text */
        span {
            pointer-events: none;
        }

        :host([editable]) span {
            pointer-events: none;
            visibility: hidden;
        }

        /* input */
        slot {
            position: absolute;
            z-index: 1;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
        }

        :host([editable]) slot {
            display: block;
        }

        ::slotted(input) {
            all: unset;
            width: 100%;
            height: 100%;
        }
      `;
      shadowRoot.append(styles);
      const container = document.createElement("div");
      const slot = document.createElement("slot");
      container.appendChild(this.inner);
      container.appendChild(slot);
      shadowRoot.append(container);
    }

    this.appendChild(this.input);
  }
}

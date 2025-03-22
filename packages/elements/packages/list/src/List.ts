import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-list": List;
    "a-list-item": ListItem;
  }
}

export class SelectEvent extends CustomEvent<{ selected: ListItem }> {
  get option() {
    return this.detail.selected;
  }

  constructor(selectedItem: ListItem) {
    super("change", {
      bubbles: true,
      detail: {
        selected: selectedItem,
      },
    });
  }
}

/**
 * Accessible and styleable list component.
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-list/
 */
export class List extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  render() {
    return html`
      <slot
        @click=${(ev) => this.onOptionsClick(ev)}
        @dblclick=${(ev) => this.onOptionsClick(ev)}
        @slotchange=${this.onSlotChange}
      ></slot>
    `;
  }

  private updateOptionsDOM() {
    const options = this.options;
    for (const option of options) {
      const optionValue = this.getValueOfOption(option);
      if (optionValue === this.selected) {
        option.ariaSelected = "true";
        option.setAttribute("selected", "");
      } else {
        option.ariaSelected = "false";
        option.removeAttribute("selected");
      }
    }
  }

  private observer = new MutationObserver(() => {
    this.onSlotChange();
  });

  private onSlotChange() {
    // update dom image
    this.options = [...this.querySelectorAll("a-list-item")] as ListItem[];
  }

  public selected?: string;

  protected updated(): void {
    this.updateOptionsDOM();

    this.selected = this.value;
  }

  /**
   * The selected option.
   */
  @property({ type: String })
  public value?: string;

  /**
   * Whether the dropdown is disabled.
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * The name or key used in form data.
   */
  @property({ type: String, reflect: true })
  public name?: string;

  /**
   * Direction of the list.
   */
  @property({ type: String, reflect: true })
  public direction: "up" | "down" = "up";

  private options: ListItem[] = [];

  constructor() {
    super();

    this.addEventListener("keydown", this.onKeyDown);
    this.addEventListener("keyup", this.onKeyUp);

    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  public connectedCallback(): void {
    super.connectedCallback();

    this.role = "listbox";
  }

  private onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        if (this.direction === "up") {
          this.selectNext();
        } else {
          this.selectPrev();
        }
        this.scrollToSelected();
        event.preventDefault();
        break;
      case "ArrowUp":
        if (this.direction === "up") {
          this.selectPrev();
        } else {
          this.selectNext();
        }
        this.scrollToSelected();
        event.preventDefault();
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        this.submitSelected();
        break;
      default:
        this.keyPressed(event.key);
        break;
    }
  }

  private keyPressed(key: string) {
    if (key.length > 1) return;

    const opt = this.options.find(
      (option) =>
        (option.value || option.innerText)?.charAt(0).toLowerCase() === key.toLowerCase(),
    );
    if (opt) {
      this.setValue(this.getValueOfOption(opt));
      opt.scrollIntoView({ block: "nearest" });
    }
  }

  /**
   * Select the next option.
   */
  public selectNext() {
    const selectedElement = this.getOptionByValue(this.selected);
    const index = selectedElement ? this.options.indexOf(selectedElement) : -1;
    const nextIndex = Math.max(index + 1, 0);
    const opt = this.options[nextIndex];
    if (opt) {
      this.setSelected(this.getValueOfOption(opt));
    }
  }

  /**
   * Select the previous option.
   */
  public selectPrev() {
    const selectedElement = this.getOptionByValue(this.selected);
    const index = selectedElement ? this.options.indexOf(selectedElement) : -1;
    const nextIndex = Math.min(index - 1, this.options.length - 1);
    const opt = this.options[nextIndex];
    if (opt) {
      this.setSelected(this.getValueOfOption(opt));
    }
  }

  private setValue(value: string | undefined) {
    this.dispatchEvent(new CustomEvent("input", { detail: value }));
    this.value = value;
    this.selected = value;
    this.updateOptionsDOM();
  }

  private setSelected(value: string | undefined) {
    this.dispatchEvent(new CustomEvent("input", { detail: value }));
    this.selected = value;
    this.updateOptionsDOM();
  }

  private scrollToSelected() {
    if (this.selected) {
      const selectedOption = this.getOptionByValue(this.selected);
      selectedOption?.scrollIntoView({ block: "nearest" });
    }
  }

  private onOptionsClick(event: Event) {
    const target = event.target as HTMLElement;

    let index = 0;
    for (const child of this.options) {
      if (child === target || child.contains(target)) {
        this.setValue(child.getAttribute("value") || index.toString());
        break;
      }
      index++;
    }

    if (event.type === "dblclick") {
      this.submitSelected();
    }
  }

  private submitSelected() {
    if (this.selected !== undefined) {
      this.value = this.selected;
      const selectedOptionElement = this.getOptionByValue(this.selected);
      if (selectedOptionElement) {
        this.dispatchEvent(new SelectEvent(selectedOptionElement));
      }
    }
  }

  private getValueOfOption(optionElement: ListItem) {
    return (
      optionElement.getAttribute("value") ||
      this.options.indexOf(optionElement).toString()
    );
  }

  private getOptionByValue(value: string | undefined) {
    if (value === undefined) return;

    for (const option of this.options) {
      const optionValue = this.getValueOfOption(option);
      if (optionValue === value) return option;
    }

    return;
  }
}

export class ListItem extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    // this.tabIndex = 0;
    this.role = "option";
  }

  @property({ type: String })
  public value!: string;

  render() {
    return html`<slot></slot>`;
  }
}

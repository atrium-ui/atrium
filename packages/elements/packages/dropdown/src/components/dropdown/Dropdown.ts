import { LitElement, css, html } from "lit";
import { property, query } from "lit/decorators.js";
import { DoropDownSelectEvent } from "./DoropDownSelectEvent";
import type { OptionElement } from "./Option";

declare global {
  interface HTMLElementTagNameMap {
    "a-dropdown": Dropdown;
  }
}

/**
 * - Accessible and styleable dropdown component
 * - Wraps the content in an a-expandable
 *
 * @attribute direction (default: "down") - In what direction the dropdown openes
 * @attribute opened (default: false) - Whether the dropdown is open
 * @attribute disabled (default: false) - Whether the dropdown is disabled.
 * @attribute selected (default: undefined) - The selected option.
 *
 * @example
 * ```html
 * <a-dropdown>
 *  <Button slot="input">
 *    <div class="w-[150px] text-left">{props.value}</div>
 *  </Button>
 *
 *  <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-800 p-1">
 *    <a-option>Option 1</a-option>
 *    <a-option>Option 2</a-option>
 *  </div>
 * </a-dropdown>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-dropdown/
 */
export class Dropdown extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;
        position: relative;
        outline: none;

        --dropdown-max-height: 200px;
        --dropdown-speed: 75ms;
				--dropdown-position: absolute;
      }
      :host([opened]) {
        z-index: 10;
      }
      .dropdown-container {
        position: var(--dropdown-position);
        top: 100%;
        width: 100%;
        background: inherit;
      }
      :host([direction="up"]) .dropdown-container {
        bottom: 100%;
        top: auto;
        width: 100%;
      }
      a-expandable {
        display: block;

        --transition-speed: var(--dropdown-speed);
      }
      .dropdown {
        max-height: var(--dropdown-max-height);
        overflow: auto;
        width: 100%;
      }
    `;
  }

  @property({ type: String, reflect: true })
  public direction: "up" | "down" = "down";

  @property({ type: String, reflect: true })
  public selected?: string;

  @property({ type: Boolean, reflect: true })
  public opened = false;

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @query(".dropdown")
  public dropdown!: HTMLElement;

  private options: OptionElement[] = [];

  public connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener("focusout", this.onBlur);
    this.addEventListener("keydown", this.onKeyDown);
    this.addEventListener("keyup", this.onKeyUp);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeEventListener("focusout", this.onBlur);
    this.removeEventListener("keydown", this.onKeyDown);
    this.removeEventListener("keyup", this.onKeyUp);
  }

  public selectNext() {
    const selectedElement = this.getOptionByValue(this.selected);
    const index = selectedElement ? this.options.indexOf(selectedElement) : -1;
    const nextIndex = Math.max(index - 1, 0);
    const opt = this.options[nextIndex];
    if (opt) {
      this.selected = this.getValueOfOption(opt);
      this.updateOptionSelection();
    }
  }

  public selectPrev() {
    const selectedElement = this.getOptionByValue(this.selected);
    const index = selectedElement ? this.options.indexOf(selectedElement) : -1;
    const nextIndex = Math.min(index + 1, this.options.length - 1);
    const opt = this.options[nextIndex];
    if (opt) {
      this.selected = this.getValueOfOption(opt);
      this.updateOptionSelection();
    }
  }

  public reset() {
    this.selected = undefined;
    this.updateOptionSelection();
  }

  private submitSelected() {
    if (this.selected) {
      const selectedOptionElement = this.getOptionByValue(this.selected);
      if (selectedOptionElement) {
        this.close();
        this.dispatchEvent(new DoropDownSelectEvent(selectedOptionElement));
      }
    }
  }

  public close() {
    this.opened = false;
    this.requestUpdate();
    this.dispatchEvent(new Event("close"));
  }

  public open() {
    if (this.disabled) return;

    this.dispatchEvent(new Event("open"));
    this.opened = true;
    this.requestUpdate();

    const inputElement = this.querySelector(`[slot="input"]`) as HTMLElement;
    if (inputElement) inputElement.focus();

    if (this.direction === "up") {
      this.dropdown.scrollTo(0, this.dropdown.scrollHeight);
    }
  }

  private onBlur(e) {
    const blurOnNextMouseUp = () => {
      window.removeEventListener("pointerup", blurOnNextMouseUp);

      if (!this.querySelector("*:focus-within")) {
        this.close();
      }
    };
    window.addEventListener("pointerup", blurOnNextMouseUp);
  }

  private onClick(event: PointerEvent) {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  private scrollToSelected() {
    if (this.selected) {
      const selectedOption = this.getOptionByValue(this.selected);
      selectedOption?.scrollIntoView({ block: "nearest" });
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowUp":
        if (this.querySelector("*:focus")) {
          if (this.direction === "up") {
            this.selectPrev();
          } else {
            this.selectNext();
          }
          this.scrollToSelected();
          event.preventDefault();
        }
        break;
      case "ArrowDown":
        if (this.querySelector("*:focus")) {
          if (this.direction === "up") {
            this.selectNext();
          } else {
            this.selectPrev();
          }
          this.scrollToSelected();
          event.preventDefault();
        }
        break;
      case "Tab":
        setTimeout(() => {
          if (!this.querySelector("*:focus-within")) {
            this.close();
          }
        }, 10);
        break;
      case "Enter":
        event.preventDefault();
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        if (this.opened && this.selected !== undefined) {
          this.submitSelected();
        }
        break;
      case "Escape":
        this.close();
        break;
      case "Tab":
        if (!this.opened) {
          this.open();
        }
        break;
    }
  }

  private onSlotChange() {
    // update dom image
    this.options = [...this.querySelectorAll("a-option")] as OptionElement[];

    if (this.direction === "up") {
      this.options.reverse();
    }
  }

  private onOptionsClick(e: MouseEvent) {
    let index = 0;
    for (const child of this.options) {
      if (child === e.target || child.contains(e.target as HTMLElement)) {
        const value = child.getAttribute("value") || index.toString();
        this.selected = value;
        this.submitSelected();
        break;
      }
      index++;
    }
  }

  private getValueOfOption(optionElement: OptionElement) {
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

  protected updated(): void {
    this.updateOptionSelection();
  }

  private updateOptionSelection() {
    const options = this.options;
    for (const option of options) {
      const optionValue = this.getValueOfOption(option);
      if (optionValue === this.selected) {
        option.setAttribute("selected", "");
      } else {
        option.removeAttribute("selected");
      }
    }
  }

  render() {
    return html`
      <slot name="input" @click=${this.onClick}></slot>
      <div class="dropdown-container" part="dropdown">
        <a-expandable ?opened="${this.opened}">
          <div class="dropdown" part="options">
            <slot @click=${this.onOptionsClick} @slotchange=${this.onSlotChange}></slot>
          </div>
        </a-expandable>
      </div>
    `;
  }
}

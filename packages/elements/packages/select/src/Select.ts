import { LitElement, css, html } from "lit";
import { property, query } from "lit/decorators.js";
import { SelectEvent } from "./SelectEvent";
import type { OptionElement } from "./Option";

declare global {
  interface HTMLElementTagNameMap {
    "a-select": Select;
  }
}

/**
 * - Accessible and styleable dropdown component
 * - Wraps the content in an a-expandable
 *
 * @example Select
 * ```html
 * <form onchange="console.log(event.target.value)" onsubmit="event.preventDefault()">
 *  <a-select name="test" class="text-base">
 *   <button type="button" slot="input" class="cursor-pointer">
 *     <div class="w-[150px] text-left">Select</div>
 *   </button>
 *
 *   <div class="mt-1 border border-zinc-700 bg-zinc-800 p-1">
 *     <a-option class="block p-1 [&[selected]]:bg-zinc-700 active:bg-zinc-700 hover:bg-zinc-600" value="option-1">Option 1</a-option>
 *     <a-option class="block p-1 [&[selected]]:bg-zinc-700 active:bg-zinc-700 hover:bg-zinc-600" value="option-2">Option 2</a-option>
 *     <a-option class="block p-1 [&[selected]]:bg-zinc-700 active:bg-zinc-700 hover:bg-zinc-600" value="option-3">Option 3</a-option>
 *     <a-option class="block p-1 [&[selected]]:bg-zinc-700 active:bg-zinc-700 hover:bg-zinc-600" value="option-4">Option 4</a-option>
 *   </div>
 *  </a-select>
 * </form>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-select/
 */
export class Select extends LitElement {
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

  // In what direction the dropdown openes
  @property({ type: String, reflect: true })
  public direction: "up" | "down" = "down";

  // The selected option.
  @property({ type: String, reflect: true })
  public value?: string;

  // Whether the dropdown is open
  @property({ type: Boolean, reflect: true })
  public opened = false;

  // Whether the dropdown is disabled.
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  // The name or key used in form data.
  @property({ type: String, reflect: true })
  public name?: string;

  @query(".dropdown")
  public dropdown!: HTMLElement;

  private options: OptionElement[] = [];

  private input = document.createElement("input");

  public connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener("focusout", this.onBlur);
    this.addEventListener("keydown", this.onKeyDown);
    this.addEventListener("keyup", this.onKeyUp);

    if (this.name) {
      this.append(this.input);
      this.input.slot = "none";
      this.input.name = this.name;
      this.input.required = true;
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeEventListener("focusout", this.onBlur);
    this.removeEventListener("keydown", this.onKeyDown);
    this.removeEventListener("keyup", this.onKeyUp);
  }

  public selectNext() {
    const selectedElement = this.getOptionByValue(this.value);
    const index = selectedElement ? this.options.indexOf(selectedElement) : -1;
    const nextIndex = Math.max(index - 1, 0);
    const opt = this.options[nextIndex];
    if (opt) {
      this.setValue(this.getValueOfOption(opt));
    }
  }

  public selectPrev() {
    const selectedElement = this.getOptionByValue(this.value);
    const index = selectedElement ? this.options.indexOf(selectedElement) : -1;
    const nextIndex = Math.min(index + 1, this.options.length - 1);
    const opt = this.options[nextIndex];
    if (opt) {
      this.setValue(this.getValueOfOption(opt));
    }
  }

  private setValue(value: string | undefined) {
    this.value = value;
    this.updateOptionSelection();
    this.input.value = value || "";
  }

  public reset() {
    this.setValue(undefined);
  }

  private submitSelected() {
    if (this.value) {
      const selectedOptionElement = this.getOptionByValue(this.value);
      if (selectedOptionElement) {
        this.close();
        this.dispatchEvent(new SelectEvent(selectedOptionElement));
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

    console.error("open");

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
    if (this.value) {
      const selectedOption = this.getOptionByValue(this.value);
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
        if (this.opened && this.value !== undefined) {
          this.submitSelected();
        }
        break;
      case "Escape":
        this.close();
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
        this.value = value;
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
      if (optionValue === this.value) {
        option.setAttribute("selected", "");
      } else {
        option.removeAttribute("selected");
      }
    }
  }
}

customElements.define("a-select", Select);

import { LitElement, css, html } from "lit";
import { property, query } from "lit/decorators.js";
import type { OptionElement } from "./Option";

declare global {
  interface HTMLElementTagNameMap {
    "a-select": Select;
  }
}

export class SelectEvent extends CustomEvent<{ selected: OptionElement }> {
  get option() {
    return this.detail.selected;
  }

  constructor(selectedItem: OptionElement) {
    super("change", {
      bubbles: true,
      detail: {
        selected: selectedItem,
      },
    });
  }
}

/**
 * Accessible and styleable select component.
 *
 * @customEvent change - Fired when the value changes.
 * @customEvent input - Fired when the selected value changes.
 * @customEvent open - Fired when the dropdown is opened.
 * @customEvent close - Fired when the dropdown is closed.
 *
 * @example Select
 * ```html
 * <form onchange="console.log(event.target.value)" onsubmit="event.preventDefault()">
 *  <a-select name="test" class="text-base">
 *   <button type="button" slot="trigger" class="cursor-pointer">
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
      <slot name="trigger" @click=${this.onClick}></slot>
      <div class="dropdown-container" part="dropdown">
        <a-expandable ?opened="${this.opened}">
          <div class="dropdown" part="options">
            <slot @click=${(ev) => this.onOptionsClick(ev.target)} @slotchange=${this.onSlotChange}></slot>
          </div>
        </a-expandable>
      </div>
    `;
  }

  /**
   * In what direction the dropdown openes.
   */
  @property({ type: String, reflect: true })
  public direction: "up" | "down" = "down";

  /**
   * The selected option.
   */
  @property({ type: String, reflect: true })
  public value?: string;

  public selected?: string;

  /**
   * Whether the dropdown is open.
   */
  @property({ type: Boolean, reflect: true })
  public opened = false;

  /**
   * Whether the dropdown is disabled.
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Wether the input is required.
   */
  @property({ type: Boolean, reflect: true })
  public required = false;

  /**
   * The name or key used in form data.
   */
  @property({ type: String, reflect: true })
  public name?: string;

  @query(".dropdown")
  public dropdown!: HTMLElement;

  private options: OptionElement[] = [];

  private input = document.createElement("input");

  private observer?: MutationObserver;

  public connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener("keydown", this.onKeyDown);
    this.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("keyup", this.globalOnKeyUp);
    window.addEventListener("click", this.onOutsideClick);

    if (this.name) {
      this.append(this.input);
    }

    this.observer = new MutationObserver(() => {
      this.onSlotChange();
    });

    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeEventListener("keydown", this.onKeyDown);
    this.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("keyup", this.globalOnKeyUp);
    window.removeEventListener("click", this.onOutsideClick);

    this.observer?.disconnect();

    this.input.remove();
  }

  /**
   * Select the next option.
   */
  public selectNext() {
    const selectedElement = this.getOptionByValue(this.selected);
    const index = selectedElement ? this.options.indexOf(selectedElement) : -1;
    const nextIndex = Math.max(index - 1, 0);
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
    const nextIndex = Math.min(index + 1, this.options.length - 1);
    const opt = this.options[nextIndex];
    if (opt) {
      this.setSelected(this.getValueOfOption(opt));
    }
  }

  private setValue(value: string | undefined) {
    this.dispatchEvent(new CustomEvent("input", { detail: value }));
    this.value = value;
    this.selected = value;
    this.updateOptionSelection();
  }

  private setSelected(value: string | undefined) {
    this.dispatchEvent(new CustomEvent("input", { detail: value }));
    this.selected = value;
    this.updateOptionSelection();
  }

  public reportValidity() {
    return this.input.reportValidity();
  }

  /**
   * Resets the value of the select to undefined.
   */
  public reset() {
    this.setValue(undefined);
  }

  private submitSelected() {
    if (this.selected !== undefined) {
      this.value = this.selected;
      this.input.value = this.value;
      const selectedOptionElement = this.getOptionByValue(this.selected);
      if (selectedOptionElement) {
        this.close();
        this.dispatchEvent(new SelectEvent(selectedOptionElement));
      }
    }
  }

  /**
   * Close the dropdown.
   */
  public close() {
    this.dispatchEvent(new Event("close"));
    this.opened = false;
    this.selected = this.value;
  }

  /**
   * Open the dropdown.
   */
  public open() {
    if (this.disabled) return;

    this.selected = this.value;

    this.dispatchEvent(new Event("open"));
    this.opened = true;

    const inputElement = this.querySelector(`[slot="trigger"]`) as HTMLElement;
    if (inputElement) inputElement.focus();
    if (this.direction === "up") {
      this.dropdown.scrollTo(0, this.dropdown.scrollHeight);
    }
  }

  private onOutsideClick = (e: MouseEvent) => {
    if (!this.contains(e.target as HTMLElement)) {
      this.close();
    }
  };

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
        if (this.opened) {
          if (this.direction === "up") {
            this.selectPrev();
          } else {
            this.selectNext();
          }
        } else {
          this.open();
        }
        this.scrollToSelected();
        event.preventDefault();
        break;
      case "ArrowDown":
        if (this.opened) {
          if (this.direction === "up") {
            this.selectNext();
          } else {
            this.selectPrev();
          }
        } else {
          this.open();
        }
        this.scrollToSelected();
        event.preventDefault();
        break;
      case "Tab":
        setTimeout(() => {
          this.close();
        }, 10);
        break;
      case "Enter":
        event.preventDefault();
        break;
      default:
        // if (event.key) {
        // TODO: implement search
        //   console.log("search for item with", event.key);
        // }
        break;
    }
  }

  private globalOnKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
        this.close();
        break;
    }
  };

  private onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        if (this.opened) {
          this.submitSelected();
        }
        break;
      default:
        this.keyPressed(event.key);
        break;
    }
  }

  private keyPressed(key: string) {
    const opt = this.options.find(
      (option) => option.value.charAt(0).toLowerCase() === key.toLowerCase(),
    );
    if (opt) {
      this.setValue(this.getValueOfOption(opt));
      opt.scrollIntoView({ block: "nearest" });
    }
  }

  private onSlotChange() {
    // update dom image
    this.options = [...this.querySelectorAll("a-option")] as OptionElement[];

    if (this.direction === "up") {
      this.options.reverse();
    }
  }

  private onOptionsClick(target: HTMLElement) {
    let index = 0;
    for (const child of this.options) {
      if (child === target || child.contains(target)) {
        const value = child.getAttribute("value") || index.toString();
        this.setValue(value);
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

    if (this.name) {
      this.input.style.display = "none";
      this.input.name = this.name;
      this.input.required = this.required;

      // set value from attributes
      this.input.value = this.value || "";

      this.selected = this.value;
    }
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
}

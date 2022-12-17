import { html, HTMLTemplateResult, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AccordionItem } from "./AccordionItem";

// TODO: Maybe generalize this element with like a child-selector?

@customElement("aui-accordion")
export class Accordion extends LitElement {
  /**
   * Keep only one open at a time
   */
  @property({ type: Boolean })
  protected exclusive?: boolean;

  protected openExclusive(target): void {
    for (let i = 0; i < this.children.length; i++) {
      const item = this.children[i] as AccordionItem;
      if (item !== target && item.opened) {
        item.close();
      }
    }
  }

  protected onItemOpened(e: Event): void {
    if (this.exclusive) {
      this.openExclusive(e.target);
    }
  }

  protected render(): HTMLTemplateResult {
    return html`<slot @item-opened-change="${this.onItemOpened}"></slot>`;
  }
}

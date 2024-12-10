import { LitElement, type TemplateResult, css, html, unsafeCSS } from "lit";

/**
 * An a-tabs is a container for multiple tabs.
 *
 * @customEvent change - Emitted when the active tab changes.
 *
 * @example
 * ```html
 * <a-tabs>
 *
 * </a-tabs>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-tabs/
 */
export class TabsElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  tabs() {
    return [...this.querySelectorAll("fra-tabs-content")];
  }

  activeTabIndex() {
    const all = this.tabs();
    return all.findIndex((tab) => tab.hasAttribute("selected"));
  }

  activeTab() {
    return this.querySelector("[selected]");
  }

  setActiveTab(id: string | null | undefined) {
    if (!id) return;

    const activeTab = this.activeTab();
    activeTab?.removeAttribute("selected");
    const content = this.querySelector(`[tab="${id}"]`);
    content?.setAttribute("selected", "");
  }

  constructor() {
    super();

    this.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const tab = target.closest("fra-tabs-item");
      this.setActiveTab(tab?.getAttribute("id"));
    });
  }

  connectedCallback() {
    super.connectedCallback();

    // respect deep linking
    const hashId = window.location.hash.slice(1);
    if (hashId) {
      const idElement = document.querySelector(`#${hashId}`);
      const tab = idElement?.closest("fra-tabs-content");
      if (tab) {
        const tabId = tab.getAttribute("tab");
        this.setActiveTab(tabId);
      }
    }
  }

  protected render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

export class TabsItemElement extends LitElement {
  protected render(): TemplateResult {
    return html`
      <button type="button">
        <slot></slot>
      </button>
    `;
  }
}

export class TabsContentElement extends LitElement {
  protected render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

if (!customElements.get("a-tabs")) {
  customElements.define("a-tabs", TabsElement);
}
if (!customElements.get("a-tabs-item")) {
  customElements.define("a-tabs-item", TabsItemElement);
}

if (!customElements.get("a-tabs-content")) {
  customElements.define("a-tabs-content", TabsContentElement);
}

// define global interface for typescript check
declare global {
  interface HTMLElementTagNameMap {
    "a-tabs": TabsElement;
    "a-tabs-item": TabsItemElement;
    "a-tabs-content": TabsContentElement;
  }
}

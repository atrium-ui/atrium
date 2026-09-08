import { LitElement, type TemplateResult, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref, createRef } from "lit/directives/ref.js";
import type { Track } from "@atrium-ui/elements/track";

export const generateTabId = (index: number): string => {
  return `tab-${index}`;
};

export const generatePanelId = (index: number): string => {
  return `tab-panel-${index}`;
};

export class TabsElement extends LitElement {
  private currentTab = 0;

  private get tabs() {
    return this.querySelectorAll("a-tabs-list a-tabs-tab");
  }

  private get tabsLength() {
    return this.tabs.length;
  }

  constructor() {
    super();

    this.addEventListener("tab-selected", this.onTabSelected as EventListener);
  }

  connectedCallback() {
    const selectedTab = this.querySelector("a-tabs-tab[selected]");
    if (selectedTab) {
      const index = Array.from(this.tabs).indexOf(selectedTab);
      if (index >= 0) {
        this.selectTabByIndex(index, false);
        this.openMobilePanelByIndex(index);
      }
    } else {
      this.selectFirstTab(false);
    }

    for (const tab of this.tabs) {
      tab?.addEventListener("keydown", this.onKeyboardPressed);
    }

    requestAnimationFrame(() => {
      this.scrollSelectedIntoView();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    for (const tab of this.tabs) {
      tab.removeEventListener("keydown", this.onKeyboardPressed);
    }

    this.removeEventListener("tab-selected", this.onTabSelected as EventListener);
  }

  onTabSelected = (e: CustomEvent<{ index: number; scrollToSelected: boolean }>) => {
    this.selectTabByIndex(e.detail.index, false);
    if (e.detail?.scrollToSelected) {
      requestAnimationFrame(() => {
        this.scrollSelectedIntoView();
      });
    }
  };

  scrollSelectedIntoView = () => {
    const tabList = this.querySelector("a-tabs-list");
    tabList?.scrollSelectedIntoView();
  };

  selectTabByIndex(index: number, setFocus = true) {
    const tab = this.tabs.item(index) as TabsTabElement;
    if (!tab) return;

    this.removeCurrentSelection();
    tab.selected = true;

    const panels = this.querySelectorAll("a-tabs-panel");
    const panel = panels.item(index) as TabsPanelElement;
    if (panel) {
      panel.selected = true;
    }

    setFocus && tab.setFocus();
    this.currentTab = index;
  }

  selectFirstTab(setFocus = true) {
    this.selectTabByIndex(0, setFocus);
  }

  selectLastTab(setFocus = true) {
    this.selectTabByIndex(this.tabsLength - 1, setFocus);
  }

  selectNextTab(setFocus = true) {
    this.selectTabByIndex((this.currentTab + 1) % this.tabsLength, setFocus);
  }

  selectPreviousTab(setFocus = true) {
    if (this.currentTab === 0) {
      this.selectTabByIndex(this.tabsLength - 1, setFocus);
    } else {
      this.selectTabByIndex(this.currentTab - 1, setFocus);
    }
  }

  removeCurrentSelection() {
    const selectedTabs = this.querySelectorAll("a-tabs-tab[selected]");
    for (const tab of selectedTabs) {
      (tab as TabsTabElement).selected = false;
    }

    const selectedPanels = this.querySelectorAll("a-tabs-panel[selected]");
    for (const panel of selectedPanels) {
      (panel as TabsPanelElement).selected = false;
    }
  }

  openMobilePanelByIndex = (index: number) => {
    const panels = this.querySelectorAll("a-tabs-panel");
    const panel = panels.item(index);
    panel?.setAttribute("openedMobile", "");
  };

  onKeyboardPressed = (event: Event) => {
    if (event instanceof KeyboardEvent) {
      switch (event.key) {
        case "ArrowLeft":
          this.selectPreviousTab();
          break;

        case "ArrowRight":
          this.selectNextTab();
          break;

        case "Home":
          this.selectFirstTab();
          break;

        case "End":
          this.selectLastTab();
          break;

        default:
          break;
      }
    }
  };
}

export class TabsListElement extends LitElement {
  static get styles() {
    return css`
      .tabs-list-container {
        position: relative;
        width: 100%;
      }

      .tabs-track {
        overflow: visible;
        display: flex;
        width: 100%;
      }

      a-track:not(:defined) {
        overflow: auto;
      }

      .tabs-inner-track {
        display: flex;
        gap: 3px;
        position: relative;
      }

      .arrow-container {
        position: absolute;
        top: 0;
        height: 100%;
        width: var(--tabs-arrow-area, 64px);
        display: flex;
        align-items: center;
        padding: 0 2px;
        box-sizing: border-box;
        pointer-events: none;
      }

      /* Fades the tabs out underneath the arrow, using the host background.
         Overhangs the container, so tabs are still covered where the list
         itself has padding or the track overflows. */
      .arrow-container::before {
        content: "";
        position: absolute;
        inset: calc(-1 * var(--tabs-arrow-overhang, 12px));
        background-color: var(--tabs-arrow-fade, #fff);
      }

      .arrow-container.left {
        left: 0;
      }

      .arrow-container.left::before {
        right: 0;
        mask-image: linear-gradient(to right, #000 55%, transparent);
      }

      .arrow-container.right {
        right: 0;
        justify-content: flex-end;
      }

      .arrow-container.right::before {
        left: 0;
        mask-image: linear-gradient(to left, #000 55%, transparent);
      }

      .arrow-button {
        all: unset;
        position: relative;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--tabs-arrow-size, 28px);
        height: var(--tabs-arrow-size, 28px);
        border-radius: var(--tabs-arrow-radius, 8px);
        color: var(--tabs-arrow-color, currentColor);
        background: var(--tabs-arrow-background, #fff);
        border: 1px solid var(--tabs-arrow-border, rgb(0 0 0 / 0.1));
        box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
        pointer-events: auto;
        cursor: pointer;
        transition: background-color 150ms, color 150ms, border-color 150ms;
      }

      .arrow-button:hover {
        background: var(--tabs-arrow-background-hover, #f4f4f5);
      }

      .arrow-button:active {
        background: var(--tabs-arrow-background-active, #e4e4e7);
      }

      .arrow-button svg {
        display: block;
      }

      @media (prefers-reduced-motion: reduce) {
        .arrow-button {
          transition: none;
        }
      }
    `;
  }

  @property({ type: String })
  public accessor label: string | undefined = undefined;

  @state()
  private accessor showLeftArrow = false;

  @state()
  private accessor showRightArrow = false;

  trackRef = createRef<Track>();
  innerTrackRef = createRef<HTMLElement>();

  connectedCallback() {
    super.connectedCallback();
  }

  onScroll = () => {
    this.handleArrowVisibility();
  };

  onFormat = () => {
    this.handleArrowVisibility();
  };

  handleArrowVisibility() {
    const track = this.trackRef.value;
    if (!track) {
      return;
    }

    const overflowWidth = (track.overflowWidth as number | undefined) ?? 0;
    const currentPosition = track.currentPosition as number | undefined;

    this.showRightArrow =
      overflowWidth > 10 &&
      !(Math.floor(currentPosition || 0) >= Math.floor(overflowWidth));
    this.showLeftArrow = Math.floor(currentPosition || 0) > 10;
  }

  onLeftArrowClick = () => {
    if (!this.trackRef.value) {
      return;
    }

    const currentPosition =
      (this.trackRef.value.currentPosition as number | undefined) ?? 0;
    const width = (this.trackRef.value.width as number | undefined) ?? 0;
    let scrollTarget = currentPosition - width / 2;
    scrollTarget = Math.max(scrollTarget, 0);

    this.trackRef.value.setTarget([scrollTarget, 0]);
  };

  onRightArrowClick = () => {
    if (!this.trackRef.value) {
      return;
    }

    const currentPosition =
      (this.trackRef.value.currentPosition as number | undefined) ?? 0;
    const width = (this.trackRef.value.width as number | undefined) ?? 0;
    const overflowWidth = (this.trackRef.value.overflowWidth as number | undefined) ?? 0;
    let scrollTarget = currentPosition + width / 2;
    scrollTarget = Math.min(scrollTarget, overflowWidth);

    this.trackRef.value.setTarget([scrollTarget, 0]);
  };

  public scrollSelectedIntoView() {
    const selectedTab = this.querySelector(
      "a-tabs-tab[selected]",
    ) as TabsTabElement | null;
    const selectedTabBounds = selectedTab?.getRect();
    const innerTrackBounds = this.innerTrackRef.value?.getBoundingClientRect();
    const maxScroll = this.trackRef.value?.overflowWidth as number | undefined;

    if (selectedTabBounds && innerTrackBounds && maxScroll !== undefined) {
      const selectedTabX = selectedTabBounds.x - innerTrackBounds.x;
      const scrollTo = Math.max(Math.min(selectedTabX - 90, maxScroll), 0);
      this.trackRef.value?.setTarget([scrollTo, 0]);
    }
  }

  protected render(): TemplateResult {
    return html`
      <div class="tabs-list-container" part="container">
        <a-track ${ref(this.trackRef)} part="track" class="tabs-track" @scroll="${this.onScroll}" @format="${this.onFormat}">
          <div ${ref(this.innerTrackRef)} part="list" class="tabs-inner-track" role="tablist" aria-label="${ifDefined(this.label)}">
            <slot></slot>
          </div>
        </a-track>
        ${
          this.showLeftArrow
            ? html`
          <div class="arrow-container left" part="arrow-container arrow-container-left">
            <button
              type="button"
              tabindex="-1"
              aria-label="Scroll tabs left"
              class="arrow-button left"
              part="arrow arrow-left"
              @click="${this.onLeftArrowClick}"
            >
              <slot name="arrow-button-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5.5 8.5 12l6.5 6.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </slot>
            </button>
          </div>
        `
            : ""
        }
        ${
          this.showRightArrow
            ? html`
          <div class="arrow-container right" part="arrow-container arrow-container-right">
            <button
              type="button"
              tabindex="-1"
              aria-label="Scroll tabs right"
              class="arrow-button right"
              part="arrow arrow-right"
              @click="${this.onRightArrowClick}"
            >
              <slot name="arrow-button-right">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5.5 15.5 12 9 18.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </slot>
            </button>
          </div>
        `
            : ""
        }
      </div>
    `;
  }
}

export class TabsPanelElement extends LitElement {
  static get styles() {
    return css`
      .tabs-panel {
        position: relative;
        max-height: 100%;
        outline-offset: -2px;
      }

      .tabs-panel[hidden="until-found"] {
        content-visibility: hidden;
      }

      .tabs-panel:focus {
        outline: 2px solid var(--color-blue-500, #3b82f6);
      }

      .tabs-panel:focus:not(:focus-visible) {
        outline: none;
      }

      .tabs-panel:focus-visible {
        outline: 2px solid var(--color-blue-500, #3b82f6);
      }
    `;
  }

  @property({ type: Boolean, reflect: true })
  public accessor selected = false;

  get index(): number {
    const parent = this.parentElement;
    if (!parent) return -1;
    const panels = Array.from(parent.querySelectorAll("a-tabs-panel"));
    return panels.indexOf(this);
  }

  connectedCallback() {
    super.connectedCallback();

    window.addEventListener("hashchange", this.onHashChange);
    this.shadowRoot?.addEventListener("beforematch", this.onBeforeMatch);
    requestAnimationFrame(() => {
      this.onHashChange();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("hashchange", this.onHashChange);
    this.shadowRoot?.removeEventListener("beforematch", this.onBeforeMatch);
  }

  onBeforeMatch = () => {
    this.emitSelection(false);
  };

  onHashChange = () => {
    if (this.isAnchorWithin(window.location.hash)) {
      this.emitSelection();
      requestAnimationFrame(() => {
        const el = this.querySelector(window.location.hash);
        el?.scrollIntoView();
      });
    }
  };

  isAnchorWithin = (hash: string): boolean => {
    if (!hash) return false;
    const hostId = this.getAttribute("id");
    const hashId = window.location.hash.slice(1);

    if (hostId === hashId) {
      return true;
    }

    const element = this.querySelector<HTMLElement>(hash);
    if (element) {
      return true;
    }

    const slots = this.querySelectorAll("slot");
    if (!slots) {
      return false;
    }

    for (const slot of slots) {
      for (const ele of slot.assignedElements()) {
        if (ele.id === hashId) {
          return true;
        }

        const link = ele?.querySelector<HTMLElement>(`#${hashId}`);
        if (link) {
          return true;
        }
      }
    }

    return false;
  };

  onExpandableChange = () => {
    !this.selected && this.emitSelection(true);

    requestAnimationFrame(() => {
      if (this.selected) {
        this.adjustPageScrollPosition(400);
      }
    });
  };

  adjustPageScrollPosition(duration: number) {
    const start = performance.now();
    const screenPosBefore = this.getBoundingClientRect().top;

    const step = () => {
      const now = performance.now();
      const progress = Math.min((now - start) / duration, 1);
      if (progress < 1) {
        const scrollPos =
          this.getBoundingClientRect().top + window.scrollY - screenPosBefore;

        if (scrollPos >= 0) {
          window.scrollTo({
            top: scrollPos,
            behavior: "instant",
          });
        }

        requestAnimationFrame(step);
      }
    };
    step();
  }

  emitSelection = (scrollToSelected = true) => {
    const tabSelectEvent = new CustomEvent("tab-selected", {
      detail: { index: this.index, scrollToSelected },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(tabSelectEvent);
  };

  protected render(): TemplateResult {
    const index = this.index;
    const hiddenValue = !this.selected ? "until-found" : undefined;

    return html`
      <div
        class="tabs-panel"
        part="panel"
        hidden="${ifDefined(hiddenValue)}"
        tabindex="${!this.selected ? "-1" : ""}"
        aria-hidden="${!this.selected ? "true" : "false"}"
        id="${generatePanelId(index)}"
        role="tabpanel"
        aria-labelledby="${generateTabId(index)}"
        tabindex="0"
      >
        <slot></slot>
      </div>
    `;
  }
}

export class TabsTabElement extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;
        position: relative;
      }

      button {
        all: unset;
        display: block;
        box-sizing: border-box;
        font-family: inherit;
        cursor: pointer;
      }

      button:focus {
        outline: 2px solid var(--color-blue-500, #3b82f6);
        outline-offset: -2px;
      }

      button:focus:not(:focus-visible) {
        outline: none;
      }

      button:focus-visible {
        outline: 2px solid var(--color-blue-500, #3b82f6);
        outline-offset: -2px;
      }

      button::after {
        content: '';
        position: absolute;
        inset: 0;
      }
    `;
  }

  buttonRef = createRef<HTMLElement>();

  @property({ type: Boolean, reflect: true })
  public accessor selected = false;

  get index(): number {
    const parent = this.parentElement;
    if (!parent) return -1;
    const tabs = Array.from(parent.querySelectorAll("a-tabs-tab"));
    return tabs.indexOf(this);
  }

  public setFocus() {
    this.buttonRef?.value?.focus();
  }

  public getRect() {
    return this.buttonRef?.value?.getBoundingClientRect();
  }

  private onTabClicked = () => {
    const tabSelectEvent = new CustomEvent("tab-selected", {
      detail: { index: this.index, scrollToSelected: false },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(tabSelectEvent);
  };

  protected render(): TemplateResult {
    const index = this.index;

    return html`
      <button
        ${ref(this.buttonRef)}
        part="tab"
        id="${generateTabId(index)}"
        role="tab"
        type="button"
        aria-selected="${this.selected}"
        aria-controls="${generatePanelId(index)}"
        tabindex="${ifDefined(!this.selected ? -1 : 0)}"
        @click="${this.onTabClicked}"
      >
        <slot></slot>
      </button>
    `;
  }
}

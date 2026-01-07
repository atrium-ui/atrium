import { LitElement, type PropertyValueMap, css, html } from "lit";
import { property } from "lit/decorators/property.js";
import { ScrollLock } from "@sv/scroll-lock";

const SELECTOR_CUSTOM_ELEMENT =
  "*:not(br,span,script,slot,p,style,div,pre,h1,h2,h3,h4,h5,img,svg)";

const SELECTOR_FOCUSABLE = "button, a[href], input, select, textarea, [tabindex]";

declare global {
  interface HTMLElementTagNameMap {
    "a-blur": Blur;
  }
}

let isKeyboard = true;

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener(
    "keydown",
    (event) => {
      isKeyboard = true;
    },
    true,
  );

  document.addEventListener(
    "pointerdown",
    (event) => {
      isKeyboard = false;
    },
    true,
  );
}

function findActiveElement(element: Element | null) {
  if (element === null) return null;

  if (element.shadowRoot) {
    return findActiveElement(element.shadowRoot.activeElement);
  }
  return element;
}

/**
 * Traverse DOM tree including shadowRoots.
 */
function traverseShadowRealm(
  rootNode: HTMLElement | ShadowRoot,
  filter: (el: HTMLElement | ShadowRoot) => HTMLElement[],
) {
  const elements: HTMLElement[] = [];

  elements.push(...filter(rootNode));

  for (const el of rootNode.querySelectorAll<HTMLElement>(SELECTOR_CUSTOM_ELEMENT)) {
    if (el.shadowRoot) {
      // how to handle elements with a shadowRoot
      elements.push(...traverseShadowRealm(el.shadowRoot, filter));
    }
  }

  return elements;
}

const findFocusableElements = (el: HTMLElement | ShadowRoot) => {
  const children: HTMLElement[] = [];

  if (
    !(el instanceof ShadowRoot) &&
    el.tabIndex >= 0 &&
    el.matches?.(SELECTOR_FOCUSABLE)
  ) {
    children.push(el);
  } else {
    for (const element of el.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLE)) {
      if (element.tabIndex >= 0) children.push(element);
    }
  }

  const slots = el.querySelectorAll<HTMLSlotElement>("slot");

  for (const slot of slots) {
    const assignedElements = slot.assignedElements({ flatten: true }) as HTMLElement[];
    for (const assignedElement of assignedElements) {
      for (const element of assignedElement.querySelectorAll<HTMLElement>(
        SELECTOR_FOCUSABLE,
      )) {
        if (element.tabIndex >= 0) children.push(element);
      }
    }
  }

  return children;
};

/**
 * An a-blur functions like a low-level dialog, it manages the focus and scrolling,
 * and provides events for when clicked outside of its children.
 *
 * @customEvent exit - Emitted when the elements is blurred / closed.
 *
 * @example
 * ```html
 * <a-blur>
 * 	<div>
 * 		<h1>Modal</h1>
 * 		<p>Click outside of this modal to close it.</p>
 * 	</div>
 * </a-blur>
 * ```
 *
 * @see https://atrium-ui.dev/elements/a-blur/
 */
export class Blur extends LitElement {
  static styles = css`
    :host {
      display: block;
      transition-property: all;
      pointer-events: none;
    }

    :host([enabled]) {
      pointer-events: all !important;
    }
  `;

  protected render() {
    return html`<slot></slot>`;
  }

  /**
   * (experimental)
   * Whether the blur should be set to inert, when not enabled.
   */
  @property({ type: String })
  public autoinert: "true" | "false" = "true";

  /**
   * (experimental)
   * Whether the blur should set the focus to the first focusable element, when enabled.
   */
  @property({ type: String })
  public initialfocus: "auto" | "false" = "auto";

  /**
   * (experimental)
   * Comma separated list of selectors to exclude from the scroll-lock.
   */
  @property({ type: String })
  public allowscroll = "";

  /**
   * The "enabled" will enable or disabled all functionality.
   * All other properties only apply, when the element is enabled.
   */
  @property({ type: Boolean, reflect: true })
  public enabled = false;

  /**
   * Whether the blur should lock scrolling, when enabled.
   */
  @property({ type: Boolean, reflect: true })
  public scrolllock = false;

  public lock: ScrollLock;

  private tryLock() {
    if (this.scrolllock) {
      this.lock.enable();
    }
  }

  private tryUnlock() {
    if (this.scrolllock) {
      this.lock.disable();
    }
  }

  private lastActiveElement: Element | null | undefined = null;

  /** Disable the blur element */
  public disable() {
    this.tryUnlock();

    if (this.autoinert === "true") {
      this.setAttribute("inert", "");
      this.setAttribute("aria-hidden", "true");
    }

    this.enabled = false;
    (this.lastActiveElement as HTMLElement)?.focus();
  }

  /** Enable the blur element */
  public enable() {
    this.tryLock();

    this.removeAttribute("inert");
    this.removeAttribute("aria-hidden");

    this.enabled = true;

    // in the case enable is called after the element is already enabled, dont set the last active element
    const activeElement = document.activeElement as HTMLElement;
    if (!this.contains(activeElement)) {
      this.lastActiveElement = findActiveElement(activeElement);
    }

    // Do not focus elements, when using a mouse,
    // because *some* browsers in *some* situations will mark the element as "focus-visible",
    // even though the click was made with the mouse.
    // TODO: idk
    if (isKeyboard && this.initialfocus === "auto") {
      const elements = this.focusableElements();
      elements[0]?.focus();
    }
  }

  private shouldBlur(e: MouseEvent) {
    if (e.target === this && this.contains(e.target as HTMLElement)) {
      return this.enabled;
    }
    return false;
  }

  private focusableElements() {
    return traverseShadowRealm(this, findFocusableElements).filter(
      (element) => element.offsetWidth > 0,
    );
  }

  protected updated(changed: PropertyValueMap<any>): void {
    if (changed.has("enabled")) this.enabled ? this.enable() : this.disable();
  }

  private tryBlur() {
    const closeEvent = new CustomEvent("exit", { cancelable: true, bubbles: true });
    this.dispatchEvent(closeEvent);

    if (closeEvent.defaultPrevented) return;
    this.disable();
  }

  private keyDownListener = (e: KeyboardEvent) => {
    if (!this.enabled) return;

    if (e.key === "Tab") {
      const elements = this.focusableElements();
      const activeElement = findActiveElement(document.activeElement);

      if (e.shiftKey) {
        if (activeElement === elements[0]) {
          elements[elements.length - 1]?.focus();
          e.preventDefault();
        }
      } else {
        if (activeElement === elements[elements.length - 1]) {
          elements[0]?.focus();
          e.preventDefault();
        }
      }
    }

    if (e.key === "Escape") {
      this.tryBlur();
    }
  };

  constructor() {
    super();

    this.lock = new ScrollLock({
      allowElements: ["a-blur *", ...this.allowscroll.split(",").filter(Boolean)],
    });

    this.addEventListener("click", (e: MouseEvent) => {
      if (!this.shouldBlur(e)) return;
      this.tryBlur();

      // cancel click events, when clicking outside to blur
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    // capture close events coming from inside the blur
    this.addEventListener(
      "exit",
      (e) => {
        if (e.target === this) {
          return; // ignore own exit events
        }

        // bubble up a new exit event and cancel the captured one
        this.tryBlur();
        e.stopPropagation();
      },
      { capture: true },
    );
  }

  public connectedCallback() {
    super.connectedCallback();

    this.role = "dialog";

    window.addEventListener("keydown", this.keyDownListener);
  }

  public disconnectedCallback(): void {
    // TODO: This call should be on a stack.
    //			 So that if multiple blur elements are enabled,
    //       it only disables when all are disabled.
    this.tryUnlock();

    super.disconnectedCallback();

    window.removeEventListener("keydown", this.keyDownListener);
  }
}

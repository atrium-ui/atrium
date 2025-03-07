import { LitElement, type PropertyValueMap, css, html } from "lit";
import { property } from "lit/decorators/property.js";
import { ScrollLock } from "@atrium-ui/scroll-lock";

const SELECTOR_CUSTOM_ELEMENT =
  "*:not(br,span,script,p,style,div,slot,pre,h1,h2,h3,h4,h5,img,svg)";

const SELECTOR_FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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

function findActiveElement(element: HTMLElement) {
  if (element?.shadowRoot) {
    return findActiveElement(element.shadowRoot.activeElement as HTMLElement);
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
      elements.push(...traverseShadowRealm(el.shadowRoot, filter));
    }
  }

  return elements;
}

const findFocusableElements = (el: HTMLElement | ShadowRoot) => {
  const children: HTMLElement[] = [];

  if (!(el instanceof ShadowRoot) && el.matches?.(SELECTOR_FOCUSABLE)) {
    children.push(el);
  } else {
    children.push(...el.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLE));
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
 * @see https://svp.pages.s-v.de/atrium/elements/a-blur/
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
   * Whether the blur is enabled or not.
   */
  @property({ type: Boolean, reflect: true }) public enabled = false;

  /**
   * (experimental)
   * Whether the blur should be set to inert, when not enabled.
   */
  @property({ type: String })
  public allowinert = "true";

  /**
   * Whether the blur should lock scrolling when shown.
   */
  @property({ type: Boolean, reflect: true })
  public scrolllock = false;

  public lock = new ScrollLock({
    allowElements: ["a-blur *"],
  });

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

  private lastActiveElement: HTMLElement | null | undefined = null;

  /** Disable the blur element */
  public disable() {
    this.tryUnlock();

    if (this.allowinert === "true") {
      this.setAttribute("inert", "");
      this.setAttribute("aria-hidden", "true");
    }

    this.enabled = false;

    this.lastActiveElement?.focus();
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
    if (isKeyboard) {
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

      if (e.shiftKey) {
        if (document.activeElement === elements[0]) {
          elements[elements.length - 1]?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === elements[elements.length - 1]) {
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

    this.addEventListener("pointerdown", (e: PointerEvent) => {
      if (!this.shouldBlur(e)) return;
      this.tryBlur();
    });

    // capture close events coming from inside the blur
    this.addEventListener(
      "exit",
      () => {
        this.disable();
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

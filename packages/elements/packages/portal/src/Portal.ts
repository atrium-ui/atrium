/**
 * The a-portal element is used to render elements (its children) in a different location in the DOM.
 * Most frameworks have their own primitives for this. Vue has [Teleports](https://vuejs.org/guide/built-ins/teleport.html),
 * React has [createPortal](https://react.dev/reference/react-dom/createPortal) and Solid as well calls it [Portal](https://docs.solidjs.com/concepts/control-flow/portal).
 *
 * @example
 * ```html
 * <a-portal>
 *   <div>
 *     Content rendered over the page
 *   </div>
 * </a-portal>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-portal/
 */
export class Portal extends (globalThis.HTMLElement || class {}) {
  private proxiedEvents = ["blur", "change"];

  private createPortal: () => HTMLElement = () => {
    const ele = this.portalGun();

    for (const event of this.proxiedEvents) {
      ele.addEventListener(event, this.proxyEvent(event), { capture: true });
    }

    return ele;
  };

  // TODO: make simpler id generator
  public portalId = crypto.randomUUID();
  public portal!: HTMLElement;

  // TODO: try to find existing portal with this.dataset.portal
  protected portalGun() {
    const ele = document.createElement("div") as HTMLElement;
    ele.dataset.portal = this.portalId;
    ele.style.position = "fixed";
    ele.style.top = "0px";
    ele.style.left = "0px";
    ele.style.zIndex = "10000000";
    return ele;
  }

  proxyEvent(name: string) {
    return (e: Event) => {
      if (e instanceof CustomEvent) {
        this.dispatchEvent(new CustomEvent(name, { detail: e.detail, bubbles: true }));
      } else {
        this.dispatchEvent(new Event(name));
      }
    };
  }

  get children() {
    return this.portal.children;
  }

  observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      if (this.childNodes.length) {
        this.portal.innerHTML = "";
        this.portal.append(...this.childNodes);
      }
    });
  });

  disconnectedCallback(): void {
    this.portal.remove();
    this.observer.disconnect();
  }

  connectedCallback(): void {
    this.observer.observe(this, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });

    this.portal = this.createPortal();

    document.body.append(this.portal);

    this.dataset.portal = this.portalId;
  }
}

if (typeof window !== "undefined") {
  customElements.define("a-portal", Portal);
}

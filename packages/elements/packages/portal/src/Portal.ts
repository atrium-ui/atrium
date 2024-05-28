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
  // TODO: make simpler id generator
  portalId = crypto.randomUUID();
  portal = this.portalGun();

  // TODO: try to find existing portal with this.dataset.portal
  protected portalGun() {
    const ele = document.createElement("div");
    ele.dataset.portal = this.portalId;
    ele.style.position = "fixed";
    ele.style.top = "0px";
    ele.style.left = "0px";
    ele.style.zIndex = "10000000";
    return ele;
  }

  observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      if (this.children.length) {
        this.portal.innerHTML = "";
        this.portal.append(...this.children);
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

    document.body.append(this.portal);

    this.dataset.portal = this.portalId;
  }
}

if (typeof window !== "undefined") {
  customElements.define("a-portal", Portal);
}

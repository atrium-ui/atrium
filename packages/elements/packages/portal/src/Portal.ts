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
    if (this.children.length) {
      requestAnimationFrame(() => {
        this.portal.innerHTML = "";
        this.portal.append(...this.children);
      });
    }
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

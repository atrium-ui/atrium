let portalIdIncrement = 10000;

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
  private proxiedEvents = [
    "blur",
    "focus",
    "change",
    "exit",
    "keyup",
    "keydown",
    "transitionstart",
    "animationstart",
    "transitionend",
    "animationend",
  ];

  // Real children, .children is override to return children of portal
  private _children = this.children;

  get children() {
    return this.portal?.children || this._children;
  }

  constructor() {
    super();

    for (const event of this.proxiedEvents) {
      this.addEventListener(event, (e: Event) => e.stopPropagation());
    }
  }

  private createPortal: () => HTMLElement = () => {
    const ele = this.portalGun();

    for (const event of this.proxiedEvents) {
      ele.addEventListener(event, this.proxyEvent(event), { capture: true });
    }

    return ele;
  };

  public portalId = (++portalIdIncrement).toString();
  public portal?: HTMLElement;

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

  protected onEventProxy(ev: Event) {}

  private proxyEvent(name: string) {
    return (e: Event) => {
      this.onEventProxy(e);

      if (e.defaultPrevented) {
        return;
      }

      const bubbles = true;

      if (e instanceof CustomEvent) {
        this.dispatchEvent(new CustomEvent(name, e));
      } else if (e instanceof MouseEvent) {
        this.dispatchEvent(new MouseEvent(name, e));
      } else if (e instanceof KeyboardEvent) {
        this.dispatchEvent(new KeyboardEvent(name, e));
      } else {
        this.dispatchEvent(new Event(name, { bubbles }));
      }
    };
  }

  private onMutation() {
    if (this.childNodes.length && this.portal) {
      this.portal.innerHTML = "";
      this.portal.append(...this.childNodes);
    }
  }

  private observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      this.onMutation();
    });
  });

  disconnectedCallback(): void {
    this.removePortal();
  }

  public autoplace = true;

  connectedCallback(): void {
    this.portal = this.createPortal();

    if (this.autoplace) {
      this.placePortal();
    }
  }

  removePortal() {
    this.portal?.remove();
    this.observer.disconnect();
  }

  placePortal() {
    this.observer.observe(this, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });

    if (this.portal) {
      document.body.append(this.portal);
    } else {
      console.error("Cant place portal, no portal element found");
    }

    this.dataset.portal = this.portalId;

    this.onMutation();
  }
}

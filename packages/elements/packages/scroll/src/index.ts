// Awsome: https://begin.com/blog/posts/2023-01-12-restoring-scroll-position-for-server-rendered-sites

const historyStorage = {
  setItem(key: string, value: string) {
    history.replaceState(
      {
        [`a-scroll-${key}`]: value,
      },
      "",
    );
  },
  getItem(key: string) {
    return window.history.state?.[`a-scroll-${key}`];
  },
};

/**
 * A scroll-container that can remember its scroll position throughout navigations.
 *
 * @example
 * ```html
 * <a-scroll>
 *   <div class="sidebar-content sl-flex">
 *     <slot name="sidebar" />
 *   </div>
 * </a-scroll>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-scroll/
 */
class ScrollElement extends HTMLElement {
  /** The unique name of the scroll container. Fallback is className + className of the parent element. */
  public name = "";

  /** Strategy to use for storing the scroll position, can be "session" or "history" */
  public strategy: "session" | "history" = "session";

  private fallbackName() {
    return `${this.className}-${this.parentElement?.className}`.replace(" ", ".");
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "name") {
      this.name = newValue || this.fallbackName();
    }
    if (name === "strategy") {
      this.strategy = (newValue as any) || "session";
    }
  }

  connectedCallback() {
    this.name = this.name || this.fallbackName();

    const storage =
      this.strategy === "session"
        ? sessionStorage
        : this.strategy === "history"
          ? historyStorage
          : undefined;

    if (storage) {
      const top = storage.getItem(this.name);
      if (top !== null) {
        this.scrollTop = Number.parseInt(top, 10);
      }

      window.addEventListener("beforeunload", () => {
        storage.setItem(this.name, this.scrollTop.toString());
      });
    }
  }
}

try {
  customElements.define("a-scroll", ScrollElement);
} catch (err) {
  console.warn("a-scroll already defined");
}

export { ScrollElement };

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
 * @see https://atrium-ui.dev/elements/a-scroll/
 */
class ScrollElement extends HTMLElement {
  /** The unique name of the scroll container. Fallback is className + className of the parent element. */
  public id = "";

  /** Strategy to use for storing the scroll position, can be "session" or "history" */
  public strategy: "session" | "history" = "session";

  private fallbackId() {
    return `${this.className}-${this.parentElement?.className}`.replace(" ", ".");
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "id") {
      this.id = newValue || this.fallbackId();
    }
    if (name === "strategy") {
      this.strategy = (newValue as any) || "session";
    }
  }

  connectedCallback() {
    this.id = this.id || this.fallbackId();

    const storage =
      this.strategy === "session"
        ? sessionStorage
        : this.strategy === "history"
          ? historyStorage
          : undefined;

    if (storage) {
      const top = storage.getItem(this.id);
      if (top !== null) {
        this.scrollTop = Number.parseInt(top, 10);
      }

      window.addEventListener("beforeunload", () => {
        storage.setItem(this.id, this.scrollTop.toString());
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

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

type Strategy = "session" | "history";

class ScrollElement extends HTMLElement {
  fallbackName() {
    return `${this.className}-${this.parentElement?.className}`.replace(" ", "-");
  }

  get name() {
    return this.getAttribute("name") || this.fallbackName();
  }

  get strategy(): Strategy {
    return (this.getAttribute("strategy") as Strategy) || "session";
  }

  connectedCallback() {
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

customElements.define("a-scroll", ScrollElement);

// Awsome: https://begin.com/blog/posts/2023-01-12-restoring-scroll-position-for-server-rendered-sites

class ScrollElement extends HTMLElement {
  connectedCallback() {
    const top = sessionStorage.getItem("docs-sidebar-scroll");
    if (top !== null) {
      this.scrollTop = Number.parseInt(top, 10);
    }
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("docs-sidebar-scroll", this.scrollTop.toString());
    });
  }
}

customElements.define("a-scroll", ScrollElement);

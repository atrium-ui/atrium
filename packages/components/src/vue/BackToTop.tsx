/* @jsxImportSource vue */
import { LitElement, type TemplateResult, html } from "lit";
import { twMerge } from "tailwind-merge";
import { state } from "lit/decorators/state.js";
import { property } from "lit/decorators.js";
import "@sv/svg-sprites/svg-icon";

const SHOW_THRESHOLD_SCREEN_HEIGHTS = 3;

export class FraBackToTop extends LitElement {
  @property({ type: "boolean" }) private visible = false;

  @state() private showButton = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("scroll", this.updateVisibilityConditions);
    window.addEventListener("resize", this.updateVisibilityConditions);
    this.updateVisibilityConditions();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("scroll", this.updateVisibilityConditions);
    window.removeEventListener("resize", this.updateVisibilityConditions);
  }

  updateVisibilityConditions = () => {
    const scrolledScreenHeights = window.scrollY / window.innerHeight;
    this.showButton = scrolledScreenHeights > SHOW_THRESHOLD_SCREEN_HEIGHTS;
  };

  onButtonClicked() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected render(): TemplateResult {
    return html`
      <div
        class="w-full fixed right-0 bottom-element-l mq4:bottom-10 left-0"
      >
        <button
          @click=${this.onButtonClicked}
          class=${twMerge(
            this.showButton || this.visible
              ? "opacity-100"
              : "pointer-events-none opacity-0",
            "absolute mq2:right-3 mq4:right-[44px] right-[128px] bottom-0 transition-opacity ease-linear",
            "flex h-10 w-10 items-center justify-center rounded-md shadow-2xl",
            "hover:text-white active:text-white",
            "bg-blue-50 hover:bg-blue-400 active:bg-blue-200",
            "text-2xl",
          )}
        >
          <svg-icon name="arrow-up"></svg-icon>
          <span class="sr-only">Go to the top of the page</span>
        </button>
      </div>
    `;
  }
}

if (!customElements.get("back-to-top")) {
  customElements.define("back-to-top", FraBackToTop);
}

// define global interface for typescript check
declare global {
  interface HTMLElementTagNameMap {
    "fra-back-to-top": FraBackToTop;
  }
}

export function BackToTop(props: { visible: boolean }) {
  return <back-to-top visible={props.visible} />;
}

import "@sv/elements/blur";
import "@sv/elements/portal";
import { LitElement, css, html } from "lit";
import { property, query, state } from "lit/decorators.js";
import { Blur } from "@sv/elements/blur";
import type { Portal } from "@sv/elements/portal";
import { ScrollLock } from "@sv/scroll-lock";

declare global {
  interface HTMLElementTagNameMap {
    "a-lightbox": Lightbox;
  }
}

let lightboxId = 0;

class LightboxBlur extends Blur {
  public override lock = new ScrollLock({
    allowElements: ["a-lightbox-blur *"],
  });

  public constructor() {
    super();
    this.scrolllock = true;
  }

  static override styles = css`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 1000;
      pointer-events: none;
    }

    :host([enabled]) {
      pointer-events: all !important;
    }

    :host(:not([enabled])) .container {
      opacity: 0 !important;
      pointer-events: none !important;
    }

    .container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 2rem;
      background: rgb(51 51 51 / 0.2);
      opacity: 1;
      transition: opacity 180ms ease;
      box-sizing: border-box;
    }

  `;

  protected override render() {
    return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

if (typeof window !== "undefined" && !customElements.get("a-lightbox-blur")) {
  customElements.define("a-lightbox-blur", LightboxBlur);
}

export class Lightbox extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
  `;

  @property({ type: Boolean, reflect: true })
  public opened = false;

  @state()
  public mounted = false;

  @query('slot[name="trigger"]')
  public triggerSlot?: HTMLSlotElement;

  @query("a-portal")
  public portalElement?: Portal;

  public transitionName = `a-lightbox-${++lightboxId}`;
  public lastActiveElement: HTMLElement | null = null;
  public transitionPromise: Promise<void> | null = null;
  public transitionTarget: boolean | null = null;
  public triggerListeners = new AbortController();
  public observer = new MutationObserver(() => {
    this.syncStructure();
  });

  public override connectedCallback() {
    super.connectedCallback();
    this.observer.observe(this, {
      childList: true,
      subtree: false,
      attributes: true,
      attributeFilter: ["slot"],
    });
  }

  public override firstUpdated() {
    this.onTriggerSlotChange();
    this.syncStructure();
  }

  public override disconnectedCallback() {
    this.observer.disconnect();
    this.triggerListeners.abort();
    super.disconnectedCallback();
  }

  public override updated(changed: Map<string, unknown>) {
    if (!changed.has("opened")) {
      return;
    }

    this.syncTriggerAttributes();
  }

  public override render() {
    return html`
      <slot name="trigger" @slotchange=${this.onTriggerSlotChange}></slot>

      ${
        this.mounted
          ? html`
              <a-portal>
                <a-lightbox-blur
                  ?enabled=${this.opened}
                  @exit=${this.onBlurExit}
                >
                  <div part="stage" @click=${this.onStageClick}>
                    <div part="content" data-content-mount></div>
                    <div part="close" data-close-mount></div>
                  </div>
                </a-lightbox-blur>
              </a-portal>
            `
          : ""
      }
    `;
  }

  public onTriggerSlotChange = () => {
    this.syncTriggerAttributes();
    this.bindTriggerClickListeners();
  };

  public onBlurExit = (event: Event) => {
    if (!(event instanceof CustomEvent) || event.target !== this.blurElement) {
      return;
    }

    event.preventDefault();
    void this.hide();
  };

  public onStageClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (this.matchesAssignedPath(event.composedPath(), this.closeElements)) {
      void this.hide();
    }
  };

  public get triggerElements() {
    return this.triggerSlot?.assignedElements({ flatten: true }) ?? [];
  }

  public get sourceContentElements() {
    return Array.from(this.children).filter((element) => element.slot === "content");
  }

  public get sourceCloseElements() {
    return Array.from(this.children).filter((element) => element.slot === "close");
  }

  public get blurElement() {
    const portalChild = this.portalElement?.portal?.children[0];
    return portalChild instanceof Blur ? portalChild : undefined;
  }

  public get contentMount() {
    return this.blurElement?.querySelector<HTMLDivElement>("[data-content-mount]");
  }

  public get closeMount() {
    return this.blurElement?.querySelector<HTMLDivElement>("[data-close-mount]");
  }

  public get contentElements() {
    return this.contentMount ? Array.from(this.contentMount.children) : [];
  }

  public get closeElements() {
    return this.closeMount ? Array.from(this.closeMount.children) : [];
  }

  public syncStructure() {
    if (!this.mounted) {
      return;
    }

    this.moveElements(
      this.sourceContentElements,
      this.contentMount,
      "a-lightbox content mount",
    );
    this.moveElements(
      this.sourceCloseElements,
      this.closeMount,
      "a-lightbox close mount",
    );
  }

  public restoreStructure() {
    this.restoreElements(this.contentElements, "content");
    this.restoreElements(this.closeElements, "close");
  }

  public syncTriggerAttributes() {
    for (const element of this.triggerElements) {
      element.setAttribute("aria-haspopup", "dialog");
      element.setAttribute("aria-expanded", this.opened ? "true" : "false");
    }
  }

  public async show() {
    return this.runTransition(true, () => this.runShow());
  }

  public async runShow() {
    if (this.opened) {
      return;
    }

    this.mounted = true;
    await this.updateComplete;
    await this.waitForPortal();
    this.syncStructure();

    this.lastActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const { triggerImage, contentImage, blur, startViewTransition } =
      await this.prepareTransition();

    triggerImage.style.viewTransitionName = this.transitionName;

    const transition = startViewTransition(() => {
      this.swapTransitionNames(triggerImage, contentImage);
      this.opened = true;
      return Promise.all([this.updateComplete, blur.updateComplete]);
    });

    await transition?.updateCallbackDone;
    this.clearTransitionNames(triggerImage, contentImage, transition?.finished);
  }

  public async hide() {
    return this.runTransition(false, () => this.runHide());
  }

  public async runHide() {
    if (!this.opened) {
      return;
    }

    const { triggerImage, contentImage, blur, startViewTransition } =
      await this.prepareTransition();

    contentImage.style.viewTransitionName = this.transitionName;

    const transition = startViewTransition(() => {
      this.swapTransitionNames(contentImage, triggerImage);
      this.opened = false;
      return Promise.all([this.updateComplete, blur.updateComplete]);
    });

    await transition?.updateCallbackDone;
    this.lastActiveElement?.focus();
    this.clearTransitionNames(triggerImage, contentImage, transition?.finished);
    await transition?.finished;
    this.mounted = false;
    this.restoreStructure();
  }

  public toggle() {
    if (this.opened) {
      void this.hide();
      return;
    }

    void this.show();
  }

  public bindTriggerClickListeners() {
    this.triggerListeners.abort();
    this.triggerListeners = new AbortController();

    for (const element of this.triggerElements) {
      element.addEventListener("click", () => void this.show(), {
        signal: this.triggerListeners.signal,
      });
    }
  }

  public moveElements(elements: Element[], mount: Element | undefined, label: string) {
    if (!mount) {
      throw new Error(`${label} is not ready`);
    }

    for (const element of elements) {
      mount.append(element);
    }
  }

  public restoreElements(elements: Element[], slot: string) {
    for (const element of elements) {
      element.slot = slot;
      this.append(element);
    }
  }

  public requireImage(elements: Element[], slot: string) {
    for (const element of elements) {
      if (element instanceof HTMLImageElement) {
        return element;
      }

      const image = element.querySelector("img");
      if (image instanceof HTMLImageElement) {
        return image;
      }
    }

    throw new Error(`a-lightbox requires an <img> inside the "${slot}" slot`);
  }

  public matchesAssignedPath(path: EventTarget[], elements: Element[]) {
    return elements.some((element) =>
      path.some(
        (target) =>
          target instanceof Node && (target === element || element.contains(target)),
      ),
    );
  }

  public requireStartViewTransition() {
    if (!(document.startViewTransition instanceof Function)) {
      throw new Error("a-lightbox requires document.startViewTransition()");
    }

    return document.startViewTransition.bind(document);
  }

  public requireBlur() {
    if (!this.blurElement) {
      throw new Error("a-lightbox blur is not ready");
    }

    return this.blurElement;
  }

  public clearTransitionNames(
    triggerImage: HTMLImageElement,
    contentImage: HTMLImageElement,
    finished?: Promise<void>,
  ) {
    const clear = () => {
      triggerImage.style.viewTransitionName = "";
      contentImage.style.viewTransitionName = "";
    };

    if (finished) {
      void finished.finally(clear);
      return;
    }

    clear();
  }

  public swapTransitionNames(from: HTMLImageElement, to: HTMLImageElement) {
    from.style.viewTransitionName = "";
    to.style.viewTransitionName = this.transitionName;
  }

  public async runTransition(target: boolean, transition: () => Promise<void>) {
    if (target ? this.opened : !this.opened) {
      if (this.transitionTarget !== !target) {
        return;
      }
    }

    if (this.transitionPromise) {
      if (this.transitionTarget === target) {
        return this.transitionPromise;
      }

      await this.transitionPromise;

      if (target ? this.opened : !this.opened) {
        return;
      }
    }

    const run = transition();
    this.transitionTarget = target;
    this.transitionPromise = run.finally(() => {
      if (this.transitionPromise === run) {
        this.transitionPromise = null;
        this.transitionTarget = null;
      }
    });

    return this.transitionPromise;
  }

  public async prepareTransition() {
    await this.updateComplete;

    const triggerImage = this.requireImage(this.triggerElements, "trigger");
    const contentImage = this.requireImage(this.contentElements, "content");
    const blur = this.requireBlur();

    await Promise.all([
      this.waitForImageReady(triggerImage),
      this.waitForImageReady(contentImage),
    ]);

    return {
      triggerImage,
      contentImage,
      blur,
      startViewTransition: this.requireStartViewTransition(),
    };
  }

  public async waitForPortal() {
    for (let index = 0; index < 5; index += 1) {
      if (this.contentMount && this.closeMount && this.blurElement) {
        return;
      }

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }

    if (!this.contentMount || !this.closeMount || !this.blurElement) {
      throw new Error("a-lightbox portal is not ready");
    }
  }

  public async waitForImageReady(image: HTMLImageElement) {
    if ("loading" in image && image.loading === "lazy") {
      image.loading = "eager";
    }

    if (image.complete && image.naturalWidth === 0) {
      throw new Error(
        `a-lightbox image failed to load: ${image.currentSrc || image.src}`,
      );
    }

    if (image.decode instanceof Function) {
      await image.decode().catch(() => {
        throw new Error(
          `a-lightbox image failed to decode: ${image.currentSrc || image.src}`,
        );
      });
    }
  }
}

import { LitElement, type PropertyValues, css, html } from "lit";
import { property } from "lit/decorators.js";

/**
 * A wrapper element to handle a loading state of its children.
 * Its help with displaying a loading state of dynamic elements.
 * For example, a error state can be displayed to the user, using just css and this element.
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-loader/
 */
export class LoaderElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        position: relative;
      }

      .loader-content {
        display: block;
        transition: opacity 200ms ease;
      }

      .loader-container {
        z-index: inherit;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        align-items: center;
        justify-content: center;

        transition: opacity 200ms ease;

        display: none;
        opacity: 0;
      }
      :host([visible]) .loader-container {
        opacity: 1;
      }
      :host([visible]) .loader-content {
        opacity: 0;
      }
      :host([loading]) .loader-container {
        display: flex;
      }

      .loader-inner {
        margin-right: 1rem;
        margin-left: 1rem;
        display: flex;
        max-width: 460px;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        border-radius: 0.5rem;
        outline: none;
        padding: 1rem;
      }
    `,
  ];

  constructor() {
    super();

    this.addEventListener(
      "load",
      () => {
        this.loading = false;
        this.error = false;
      },
      {
        capture: true,
      },
    );

    this.addEventListener(
      "error",
      () => {
        this.error = true;
      },
      {
        capture: true,
      },
    );
  }

  /**
   * Set, if the child element is in an error state.
   */
  @property({ type: Boolean, reflect: true }) public error = false;

  /**
   * Set, if the child element is currently still loading.
   */
  @property({ type: Boolean, reflect: true }) public loading = false;

  /**
   * Set, if the loader is visible.
   */
  @property({ type: Boolean, reflect: true }) private visible = false;

  /**
   * The delay in ms, before the loader is shown.
   */
  @property({ type: Number }) public delay = 300;

  private timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  protected updated(_changedProperties: PropertyValues) {
    // Have timeout to prevent flicker on quick load
    // Also the timeout enables the opacity transition on 'display: none' element
    if (_changedProperties.has("loading")) {
      if (this.loading) {
        this.timeoutId !== undefined && clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
          this.visible = true;
        }, this.delay);
      } else {
        this.visible = false;
        this.timeoutId !== undefined && clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }
    }
  }

  protected render() {
    return html`
      <slot class="loader-content" ?inert="${this.loading}"></slot>

      <div aria-live="polite" class="loader-container" part="loader">
        <slot name="loader">
          <div class="loader-inner">Loading...</div>
        </slot>
      </div>
    `;
  }
}

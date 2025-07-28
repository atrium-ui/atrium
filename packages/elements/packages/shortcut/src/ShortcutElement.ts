import { LitElement, css, html, svg } from "lit";
import { property } from "lit/decorators/property.js";

const OS = navigator.platform;

/**
 * Display a shortcut.
 *
 * @see https://sv.pages.s-v.de/sv-frontend-library/mono/elements/a-shortcut/
 */
export class ShortcutElement extends LitElement {
  static ICONS = {
    cmd: "⌘",
    ctrl: svg`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,125.66a8,8,0,0,1-11.32,0L128,59.31,61.66,125.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,125.66Z"></path></svg>`,
    shift: svg`<svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="currentColor"
        viewBox="0 0 256 256"
      >
        <path
          d="M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v80a16,16,0,0,0,16,16h80a16,16,0,0,0,16-16V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v88H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Z"
        ></path>
      </svg>`,
    alt: "Alt",
    option: "⌥",
    enter: "↵",
    space: "␣",
  };

  static styles = css`
    :host {
      vertical-align: text-bottom;
      display: inline-block;
      font-family: monospace;
      font-size: 1em;
      color: white;
      line-height: 100%;
      vertical-align: text-top;

      --background-color: #eee;
      --seperator: "";
    }
    .shortcut {
      display: inline-flex;
      align-items: center;
      gap: 0.05em;
    }
    .key {
      display: block;
      padding: 0.25em 0.35em;
      min-width: 1em;
      background-color: var(--background-color);
      border-radius: 0.25em;
      line-height: 100%;
      font-size: 0.75em;
    }
    .spacer::after {
      content: var(--seperator);
    }
    svg {
      display: block;
    }
  `;

  connectedCallback() {
    super.connectedCallback();

    this.ariaLabel = "Shortcut: " + this.value;
  }

  /**
   * Comma seperated shortcut key combinations. Zed syntax.
   */
  @property({ type: String })
  public value?: string;

  render() {
    const combinations = this.value?.split(",").map((c) => c.trim());

    const prefferedCombination =
      combinations?.find((c) => OS === "MacIntel" && c.includes("cmd")) ||
      combinations?.[0];

    const keys = prefferedCombination?.split("-").map(
      (key) =>
        html`<span class="key"
            >${ShortcutElement.ICONS[key] || key.toUpperCase()}</span
          >`,
    );

    return html`
      <div class="shortcut" aria-hidden="true">
        ${keys?.map((key, index) =>
          index > 0 ? html`<span class="spacer"></span>${key}` : key,
        )}
      </div>
    `;
  }
}

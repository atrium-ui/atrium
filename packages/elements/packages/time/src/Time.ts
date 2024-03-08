import { type HTMLTemplateResult, LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { formatDate, formatTime } from "./format.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-time": Time;
  }
}

@customElement("a-time")
export class Time extends LitElement {
  public static styles = css`
    :host {
      display: inline;
    }
  `;

  // @property({ type: Number })
  // public time: number = 0;
  public get time() {
    return +this.innerHTML;
  }

  private interval = 10000;

  connectedCallback(): void {
    super.connectedCallback();
    this.updateTime();
  }

  updateTime() {
    this.requestUpdate();
    setInterval(() => this.updateTime(), this.interval);
  }

  protected render(): HTMLTemplateResult {
    const time = new Date(this.time);
    this.title = formatDate(time);
    return html`<span>${formatTime(time)}</span>`;
  }
}

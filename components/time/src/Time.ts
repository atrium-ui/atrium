import { html, HTMLTemplateResult, LitElement, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatTime, formatDate } from "./format.js";

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

  private interval: number = 10000;

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

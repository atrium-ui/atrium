import { Range } from "@atrium-ui/elements/range";
import {
  PlayerController,
  playerContext,
  selectFullscreen,
  selectPlayback,
  selectTime,
  selectVolume,
} from "@videojs/html";
import { LitElement, type PropertyValues, css, html } from "lit";
import { property } from "lit/decorators/property.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-video-play": VideoPlayElement;
    "a-video-mute": VideoMuteElement;
    "a-video-fullscreen": VideoFullscreenElement;
    "a-video-time": VideoTimeElement;
    "a-video-seek": VideoSeekElement;
    "a-video-volume": VideoVolumeElement;
  }
}

/**
 * Returns the controller value, throws if the element is not inside a `<video-player>`.
 */
function connected<T>(controller: { value: T | undefined }): T {
  if (controller.value === undefined) {
    throw new Error("Video element has to be placed inside a <video-player>");
  }
  return controller.value;
}

/**
 * Formats seconds as `m:ss` or `h:mm:ss`, padded to the digits of `max`,
 * so the text keeps its width while the time changes.
 */
function formatTime(seconds: number, max: number) {
  const units = (t: number) => [Math.floor(t / 3600), Math.floor((t / 60) % 60), Math.floor(t % 60)];
  const [h = 0, m = 0, s = 0] = units(seconds);
  const [maxH = 0, maxM = 0] = units(max);
  const segments =
    maxH > 0
      ? [h.toString().padStart(maxH.toString().length, "0"), m.toString().padStart(2, "0")]
      : [m.toString().padStart(maxM >= 10 ? 2 : 1, "0")];
  return [...segments, s.toString().padStart(2, "0")].join(":");
}

/**
 * Base for video control buttons. The host element acts as the button.
 * The accessible name comes from the slotted content of the current state.
 */
export abstract class VideoButtonElement extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
    }

    /* The host has to be the event target, so gestures recognize it as interactive */
    ::slotted(*) {
      pointer-events: none;
    }
  `;

  abstract activate(): void;

  onClick = () => this.activate();

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.activate();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    this.role = "button";
    this.tabIndex = 0;
    this.addEventListener("click", this.onClick);
    this.addEventListener("keydown", this.onKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.onClick);
    this.removeEventListener("keydown", this.onKeyDown);
    super.disconnectedCallback();
  }
}

/**
 * Toggles playback. Shows the "play" slot while paused and the "pause" slot while playing.
 *
 * @example
 * ```html
 * <a-video-play>
 *   <span slot="play">Play</span>
 *   <span slot="pause">Pause</span>
 * </a-video-play>
 * ```
 */
export class VideoPlayElement extends VideoButtonElement {
  playback = new PlayerController(this, playerContext, selectPlayback);

  activate() {
    const playback = connected(this.playback);
    if (playback.paused) playback.play();
    else playback.pause();
  }

  render() {
    return html`<slot name=${this.playback.value?.paused === false ? "pause" : "play"}></slot>`;
  }
}

/**
 * Toggles mute. Shows the "mute" slot while audible and the "unmute" slot while muted.
 *
 * @example
 * ```html
 * <a-video-mute>
 *   <span slot="mute">Mute</span>
 *   <span slot="unmute">Unmute</span>
 * </a-video-mute>
 * ```
 */
export class VideoMuteElement extends VideoButtonElement {
  volume = new PlayerController(this, playerContext, selectVolume);

  activate() {
    const volume = connected(this.volume);
    volume.setMuted(!volume.muted);
  }

  render() {
    return html`<slot name=${this.volume.value?.muted ? "unmute" : "mute"}></slot>`;
  }
}

/**
 * Toggles fullscreen of the `<media-container>`. Shows the "enter" or "exit" slot.
 *
 * @example
 * ```html
 * <a-video-fullscreen>
 *   <span slot="enter">Fullscreen</span>
 *   <span slot="exit">Exit fullscreen</span>
 * </a-video-fullscreen>
 * ```
 */
export class VideoFullscreenElement extends VideoButtonElement {
  fullscreen = new PlayerController(this, playerContext, selectFullscreen);

  activate() {
    const fullscreen = connected(this.fullscreen);
    if (fullscreen.isFullscreen) fullscreen.exitFullscreen();
    else fullscreen.requestFullscreen();
  }

  render() {
    return html`<slot name=${this.fullscreen.value?.isFullscreen ? "exit" : "enter"}></slot>`;
  }
}

/**
 * Displays the current time, duration or remaining time of the video.
 *
 * @example
 * ```html
 * <a-video-time type="current"></a-video-time> / <a-video-time type="duration"></a-video-time>
 * ```
 */
export class VideoTimeElement extends LitElement {
  static styles = css`
    :host {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
  `;

  /** Which time to display. */
  @property({ type: String })
  public accessor type: "current" | "duration" | "remaining" = "current";

  time = new PlayerController(this, playerContext, selectTime);

  render() {
    const time = this.time.value;
    if (!time) return formatTime(0, 0);

    switch (this.type) {
      case "current":
        return formatTime(time.currentTime, time.duration);
      case "duration":
        return formatTime(time.duration, time.duration);
      case "remaining":
        return `-${formatTime(time.duration - time.currentTime, time.duration)}`;
    }
  }
}

/**
 * Seek slider for the video timeline. The value is the progress from 0 to 1.
 * Styled like `<a-range>` through its css custom properties and parts.
 *
 * @example
 * ```html
 * <a-video-seek></a-video-seek>
 * ```
 */
export class VideoSeekElement extends Range {
  /** Seconds to seek with the arrow keys. */
  @property({ type: Number, attribute: "key-step" })
  public accessor keyStep = 5;

  time = new PlayerController(this, playerContext, selectTime);

  constructor() {
    super();
    this.step = 0.0001;
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    const time = this.time.value;
    if (!time) return;

    this.disabled = time.duration === 0;
    // the user is dragging the handle, don't move it
    if (!this.dragStartPosition && time.duration > 0) {
      this.value = time.currentTime / time.duration;
    }
  }

  protected updateProgress(progress: number) {
    super.updateProgress(progress);
    const time = connected(this.time);
    time.seek(this.value * time.duration);
  }

  protected onKeyDown(e: KeyboardEvent) {
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (!direction) return;

    e.preventDefault();
    const time = connected(this.time);
    time.seek(time.currentTime + direction * this.keyStep);
  }
}

/**
 * Volume slider from 0 to 1. Shows 0 while muted and unmutes when changed.
 * Styled like `<a-range>` through its css custom properties and parts.
 *
 * @example
 * ```html
 * <a-video-volume></a-video-volume>
 * ```
 */
export class VideoVolumeElement extends Range {
  /** Volume change with the arrow keys. */
  @property({ type: Number, attribute: "key-step" })
  public accessor keyStep = 0.1;

  volume = new PlayerController(this, playerContext, selectVolume);

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    const volume = this.volume.value;
    if (!volume) return;

    if (!this.dragStartPosition) {
      this.value = volume.muted ? 0 : volume.volume;
    }
  }

  protected updateProgress(progress: number) {
    super.updateProgress(progress);
    this.setVolume(this.value);
  }

  protected onKeyDown(e: KeyboardEvent) {
    const direction = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!direction) return;

    e.preventDefault();
    const volume = connected(this.volume);
    this.setVolume((volume.muted ? 0 : volume.volume) + direction * this.keyStep);
  }

  setVolume(value: number) {
    const volume = connected(this.volume);
    const clamped = volume.setVolume(value);
    if (volume.muted !== (clamped === 0)) volume.setMuted(clamped === 0);
  }
}

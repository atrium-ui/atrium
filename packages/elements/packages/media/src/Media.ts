import { Range } from "@atrium-ui/elements/range";
import {
  LitElement,
  type PropertyValues,
  type ReactiveController,
  type ReactiveControllerHost,
  css,
  html,
} from "lit";
import { property } from "lit/decorators/property.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-media": MediaElement;
    "a-media-play": MediaPlayElement;
    "a-media-mute": MediaMuteElement;
    "a-media-skip": MediaSkipElement;
    "a-media-rate": MediaRateElement;
    "a-media-fullscreen": MediaFullscreenElement;
    "a-media-time": MediaTimeElement;
    "a-media-seek": MediaSeekElement;
    "a-media-volume": MediaVolumeElement;
  }
}

/**
 * Container for an `<audio>` or `<video>` element and its controls.
 * Controls placed anywhere inside of it control the first media element.
 * It is also the element that `<a-media-fullscreen>` shows in fullscreen.
 *
 * @example
 * ```html
 * <a-media>
 *   <audio src="episode.mp3" preload="metadata"></audio>
 *   <a-media-play>
 *     <span slot="play">Play</span>
 *     <span slot="pause">Pause</span>
 *   </a-media-play>
 * </a-media>
 * ```
 */
export class MediaElement extends HTMLElement {
  /** The controlled media element. */
  get media(): HTMLMediaElement | null {
    return this.querySelector("audio, video");
  }
}

/** Media events that change the state shown by the controls. */
const MEDIA_EVENTS = [
  "play",
  "pause",
  "ended",
  "emptied",
  "timeupdate",
  "durationchange",
  "loadedmetadata",
  "volumechange",
  "ratechange",
];

/**
 * Connects a control element to the media element of its closest `<a-media>` and updates the host on media events.
 * Media events don't bubble, so they are captured on the `<a-media>` container.
 */
export class MediaController implements ReactiveController {
  host: ReactiveControllerHost & HTMLElement;
  player: MediaElement | undefined;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  onMediaEvent = () => this.host.requestUpdate();

  hostConnected() {
    const player = this.host.closest("a-media");
    if (!player) {
      throw new Error("Media element has to be placed inside an <a-media>");
    }
    this.player = player;
    for (const type of MEDIA_EVENTS) {
      player.addEventListener(type, this.onMediaEvent, true);
    }
  }

  hostDisconnected() {
    for (const type of MEDIA_EVENTS) {
      this.player?.removeEventListener(type, this.onMediaEvent, true);
    }
    this.player = undefined;
  }

  /** The media element, undefined while it is not in the DOM. */
  get media(): HTMLMediaElement | undefined {
    return this.player?.media ?? undefined;
  }
}

/**
 * Returns the media element of the controller, throws if there is none.
 */
function connected(controller: MediaController): HTMLMediaElement {
  const media = controller.media;
  if (!media) {
    throw new Error("<a-media> has no <audio> or <video> element");
  }
  return media;
}

/**
 * Formats seconds as `m:ss` or `h:mm:ss`, padded to the digits of `max`,
 * so the text keeps its width while the time changes.
 */
function formatTime(seconds: number, max: number) {
  const units = (t: number) => [
    Math.floor(t / 3600),
    Math.floor((t / 60) % 60),
    Math.floor(t % 60),
  ];
  const [h = 0, m = 0, s = 0] = units(seconds);
  const [maxH = 0, maxM = 0] = units(max);
  const segments =
    maxH > 0
      ? [
          h.toString().padStart(maxH.toString().length, "0"),
          m.toString().padStart(2, "0"),
        ]
      : [m.toString().padStart(maxM >= 10 ? 2 : 1, "0")];
  return [...segments, s.toString().padStart(2, "0")].join(":");
}

/**
 * Duration of the media in seconds, 0 while unknown or for live streams.
 */
function duration(media: HTMLMediaElement | undefined) {
  return media && Number.isFinite(media.duration) ? media.duration : 0;
}

/**
 * Base for media control buttons. The host element acts as the button.
 * The accessible name comes from the slotted content.
 */
export abstract class MediaButtonElement extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
    }

    /* The host has to be the event target, so gesture handlers recognize it as interactive */
    ::slotted(*) {
      pointer-events: none;
    }
  `;

  controller = new MediaController(this);

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
 * <a-media-play>
 *   <span slot="play">Play</span>
 *   <span slot="pause">Pause</span>
 * </a-media-play>
 * ```
 */
export class MediaPlayElement extends MediaButtonElement {
  activate() {
    const media = connected(this.controller);
    if (media.paused) media.play();
    else media.pause();
  }

  render() {
    return html`<slot name=${this.controller.media?.paused === false ? "pause" : "play"}></slot>`;
  }
}

/**
 * Toggles mute. Shows the "mute" slot while audible and the "unmute" slot while muted.
 *
 * @example
 * ```html
 * <a-media-mute>
 *   <span slot="mute">Mute</span>
 *   <span slot="unmute">Unmute</span>
 * </a-media-mute>
 * ```
 */
export class MediaMuteElement extends MediaButtonElement {
  activate() {
    const media = connected(this.controller);
    media.muted = !media.muted;
  }

  render() {
    return html`<slot name=${this.controller.media?.muted ? "unmute" : "mute"}></slot>`;
  }
}

/**
 * Skips forward or backward by a number of seconds.
 *
 * @example
 * ```html
 * <a-media-skip seconds="-15">Back 15 seconds</a-media-skip>
 * <a-media-skip seconds="30">Forward 30 seconds</a-media-skip>
 * ```
 */
export class MediaSkipElement extends MediaButtonElement {
  /** Seconds to skip, negative values skip backward. */
  @property({ type: Number })
  public accessor seconds = 15;

  activate() {
    if (typeof this.seconds !== "number") {
      throw new Error("<a-media-skip> seconds has to be a number");
    }
    const media = connected(this.controller);
    media.currentTime = Math.min(
      Math.max(media.currentTime + this.seconds, 0),
      duration(media),
    );
  }

  render() {
    return html`<slot></slot>`;
  }
}

/**
 * Cycles through playback rates. Renders the current rate, like "1.5×", after the slotted content.
 *
 * @example
 * ```html
 * <a-media-rate rates="[1, 1.5, 2]">
 *   <span class="sr-only">Playback speed</span>
 * </a-media-rate>
 * ```
 */
export class MediaRateElement extends MediaButtonElement {
  /** Playback rates to cycle through. */
  @property({ type: Array })
  public accessor rates = [1, 1.25, 1.5, 2];

  activate() {
    const media = connected(this.controller);
    const index = this.rates.indexOf(media.playbackRate);
    const next = this.rates[(index + 1) % this.rates.length];
    if (next === undefined) {
      throw new Error("<a-media-rate> needs at least one rate");
    }
    media.playbackRate = next;
  }

  render() {
    return html`<slot></slot>${this.controller.media?.playbackRate ?? 1}×`;
  }
}

/**
 * Toggles fullscreen of the closest `<a-media>`. Shows the "enter" or "exit" slot.
 *
 * @example
 * ```html
 * <a-media-fullscreen>
 *   <span slot="enter">Fullscreen</span>
 *   <span slot="exit">Exit fullscreen</span>
 * </a-media-fullscreen>
 * ```
 */
export class MediaFullscreenElement extends MediaButtonElement {
  onFullscreenChange = () => this.requestUpdate();

  /** Whether the `<a-media>` or an element inside of it is in fullscreen. */
  get isFullscreen() {
    const element = document.fullscreenElement;
    return element !== null && this.controller.player?.contains(element) === true;
  }

  activate() {
    if (this.isFullscreen) {
      document.exitFullscreen();
      return;
    }

    if (document.fullscreenEnabled) {
      this.controller.player?.requestFullscreen();
      return;
    }

    // iPhone Safari can only show video elements in fullscreen
    const media = connected(this.controller) as HTMLMediaElement & {
      webkitEnterFullscreen?: () => void;
    };
    if (!media.webkitEnterFullscreen) {
      throw new Error("Fullscreen is not supported");
    }
    media.webkitEnterFullscreen();
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("fullscreenchange", this.onFullscreenChange);
  }

  disconnectedCallback() {
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
    super.disconnectedCallback();
  }

  render() {
    return html`<slot name=${this.isFullscreen ? "exit" : "enter"}></slot>`;
  }
}

/**
 * Displays the current time, duration or remaining time of the media.
 *
 * @example
 * ```html
 * <a-media-time type="current"></a-media-time> / <a-media-time type="duration"></a-media-time>
 * ```
 */
export class MediaTimeElement extends LitElement {
  static styles = css`
    :host {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
  `;

  /** Which time to display. */
  @property({ type: String })
  public accessor type: "current" | "duration" | "remaining" = "current";

  controller = new MediaController(this);

  render() {
    const media = this.controller.media;
    const total = duration(media);
    const current = media?.currentTime ?? 0;

    switch (this.type) {
      case "current":
        return formatTime(current, total);
      case "duration":
        return formatTime(total, total);
      case "remaining":
        return `-${formatTime(total - current, total)}`;
    }
  }
}

/**
 * Seek slider for the media timeline. The value is the progress from 0 to 1.
 * Styled like `<a-range>` through its css custom properties and parts.
 *
 * @example
 * ```html
 * <a-media-seek label="Seek"></a-media-seek>
 * ```
 */
export class MediaSeekElement extends Range {
  /** Seconds to seek with the arrow keys. */
  @property({ type: Number, attribute: "key-step" })
  public accessor keyStep = 5;

  controller = new MediaController(this);

  constructor() {
    super();
    this.step = 0.0001;
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    const total = duration(this.controller.media);
    this.disabled = total === 0;
    // the user is dragging the handle, don't move it
    if (!this.dragStartPosition && total > 0) {
      this.value = (this.controller.media?.currentTime ?? 0) / total;
    }
  }

  protected updateProgress(progress: number) {
    super.updateProgress(progress);
    const media = connected(this.controller);
    media.currentTime = this.value * duration(media);
  }

  protected onKeyDown(e: KeyboardEvent) {
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (!direction) return;

    e.preventDefault();
    const media = connected(this.controller);
    media.currentTime = Math.min(
      Math.max(media.currentTime + direction * this.keyStep, 0),
      duration(media),
    );
  }
}

/**
 * Volume slider from 0 to 1. Shows 0 while muted and unmutes when changed.
 * Styled like `<a-range>` through its css custom properties and parts.
 *
 * @example
 * ```html
 * <a-media-volume label="Volume"></a-media-volume>
 * ```
 */
export class MediaVolumeElement extends Range {
  /** Volume change with the arrow keys. */
  @property({ type: Number, attribute: "key-step" })
  public accessor keyStep = 0.1;

  controller = new MediaController(this);

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    const media = this.controller.media;
    if (media && !this.dragStartPosition) {
      this.value = media.muted ? 0 : media.volume;
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
    const media = connected(this.controller);
    this.setVolume((media.muted ? 0 : media.volume) + direction * this.keyStep);
  }

  setVolume(value: number) {
    const media = connected(this.controller);
    const clamped = Math.min(Math.max(value, 0), 1);
    media.volume = clamped;
    media.muted = clamped === 0;
  }
}

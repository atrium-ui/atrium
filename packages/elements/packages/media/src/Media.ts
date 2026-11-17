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
    "a-media-time": MediaTimeElement;
    "a-media-seek": MediaSeekElement;
    "a-media-volume": MediaVolumeElement;
  }
}

/**
 * Container for an `<audio>` or `<video>` element and its controls.
 * Controls placed anywhere inside of it control the first media element.
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

/**
 * Connects a control element to the media element of its closest `<a-media>`.
 * Updates the host only on the given media events, so controls don't re-render on unrelated changes.
 * Media events don't bubble, so they are captured on the `<a-media>` container.
 */
export class MediaController implements ReactiveController {
  host: ReactiveControllerHost & HTMLElement;
  events: string[];
  player: MediaElement | undefined;

  constructor(host: ReactiveControllerHost & HTMLElement, events: string[]) {
    this.host = host;
    this.events = events;
    host.addController(this);
  }

  onMediaEvent = () => this.host.requestUpdate();

  hostConnected() {
    const player = this.host.closest("a-media");
    if (!player) {
      throw new Error("Media element has to be placed inside an <a-media>");
    }
    this.player = player;
    for (const type of this.events) {
      player.addEventListener(type, this.onMediaEvent, true);
    }
  }

  hostDisconnected() {
    for (const type of this.events) {
      this.player?.removeEventListener(type, this.onMediaEvent, true);
    }
    this.player = undefined;
  }

  /** The media element, undefined while it is not in the DOM. */
  get media(): HTMLMediaElement | undefined {
    return this.player?.media ?? undefined;
  }
}

/** Events that change the playback position or duration. */
const TIME_EVENTS = ["timeupdate", "durationchange", "emptied"];

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
 * End of the buffered range at the current time in seconds, 0 if the current time is not buffered.
 */
function bufferedEnd(media: HTMLMediaElement) {
  for (let i = 0; i < media.buffered.length; i++) {
    const end = media.buffered.end(i);
    if (media.buffered.start(i) <= media.currentTime && media.currentTime <= end) {
      return end;
    }
  }
  return 0;
}

/**
 * Whether the volume can be changed. iOS ignores volume changes, only muting works there.
 */
function canSetVolume() {
  const audio = document.createElement("audio");
  audio.volume = 0.5;
  return audio.volume === 0.5;
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

    :host([aria-disabled="true"]) {
      cursor: default;
    }

    /* The host has to be the event target, so gesture handlers recognize it as interactive */
    ::slotted(*) {
      pointer-events: none;
    }
  `;

  abstract controller: MediaController;

  abstract activate(): void;

  onClick = () => this.activate();

  // ARIA button pattern: Enter activates on keydown, Space on keyup
  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.activate();
    } else if (e.key === " ") {
      // prevent page scroll
      e.preventDefault();
    }
  };

  onKeyUp = (e: KeyboardEvent) => {
    if (e.key === " ") this.activate();
  };

  connectedCallback() {
    super.connectedCallback();
    this.role = "button";
    this.tabIndex = 0;
    this.addEventListener("click", this.onClick);
    this.addEventListener("keydown", this.onKeyDown);
    this.addEventListener("keyup", this.onKeyUp);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.onClick);
    this.removeEventListener("keydown", this.onKeyDown);
    this.removeEventListener("keyup", this.onKeyUp);
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
  controller = new MediaController(this, ["play", "pause", "emptied"]);

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
  controller = new MediaController(this, ["volumechange"]);

  activate() {
    const media = connected(this.controller);
    media.muted = !media.muted;
  }

  render() {
    return html`<slot name=${this.controller.media?.muted ? "unmute" : "mute"}></slot>`;
  }
}

/**
 * Skips forward or backward by a number of seconds. Disabled while the duration is unknown.
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

  controller = new MediaController(this, ["durationchange", "emptied"]);

  get disabled() {
    return duration(this.controller.media) === 0;
  }

  activate() {
    if (typeof this.seconds !== "number") {
      throw new Error("<a-media-skip> seconds has to be a number");
    }
    if (this.disabled) return;

    const media = connected(this.controller);
    media.currentTime = Math.min(
      Math.max(media.currentTime + this.seconds, 0),
      duration(media),
    );
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    this.ariaDisabled = String(this.disabled);
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

  controller = new MediaController(this, ["ratechange"]);

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

  controller = new MediaController(this, TIME_EVENTS);

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
 * Seek slider for the media timeline. The value is the progress from 0 to 1,
 * the buffer shows how far the media is loaded from the current time.
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

  controller = new MediaController(this, [...TIME_EVENTS, "progress"]);

  constructor() {
    super();
    this.step = 0.0001;
  }

  get valueText() {
    const total = duration(this.controller.media);
    return `${formatTime(this.value * total, total)} of ${formatTime(total, total)}`;
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    const media = this.controller.media;
    const total = duration(media);
    this.disabled = total === 0;
    if (!media || total === 0) return;

    this.buffer = bufferedEnd(media) / total;
    // the user is dragging the handle, don't move it
    if (!this.dragStartPosition) {
      this.value = media.currentTime / total;
    }
  }

  protected updateProgress(progress: number) {
    super.updateProgress(progress);
    const media = connected(this.controller);
    media.currentTime = this.value * duration(media);
  }

  protected onKeyDown(e: KeyboardEvent) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;

    const media = connected(this.controller);
    const total = duration(media);
    const time = {
      ArrowLeft: media.currentTime - this.keyStep,
      ArrowRight: media.currentTime + this.keyStep,
      Home: 0,
      End: total,
    }[e.key];
    if (time === undefined) return;

    e.preventDefault();
    media.currentTime = Math.min(Math.max(time, 0), total);
  }
}

/**
 * Volume slider from 0 to 1. Shows 0 while muted and unmutes when changed.
 * Hidden on platforms that don't allow changing the volume, like iOS.
 * Styled like `<a-range>` through its css custom properties and parts.
 *
 * @example
 * ```html
 * <a-media-volume label="Volume"></a-media-volume>
 * ```
 */
export class MediaVolumeElement extends Range {
  static get styles() {
    return [
      Range.styles,
      css`
        :host([hidden]) {
          display: none;
        }
      `,
    ];
  }

  /** Volume change with the arrow keys. */
  @property({ type: Number, attribute: "key-step" })
  public accessor keyStep = 0.1;

  controller = new MediaController(this, ["volumechange"]);

  get valueText() {
    return `${Math.round(this.value * 100)}%`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.hidden = !canSetVolume();
  }

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

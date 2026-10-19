import { h, isTyping, setText } from "./dom.ts";
import { isCalendarData } from "./ics.ts";
import { PointerController } from "./interactions.ts";
import { BAND_RATIO, type BusynessMode, CalendarModel, MAX_IMPORT_BYTES } from "./model.ts";
import { defaultLayers, drawStrip, type Layer, type Paint } from "./paint.ts";
import type { CalendarEventPanel } from "./panel.ts";
import { anchorOf, buildScene, type Geometry, type Scene } from "./scene.ts";
import { defaultStrings, type Strings } from "./strings.ts";
import { styles } from "./styles.ts";
import { readTheme, type Theme } from "./theme.ts";
import { clamp, dateOf, isWeekend, weekStart } from "./time.ts";
import type { CalendarEvent, CalendarEventMap, CalendarInfo, ResponseStatus } from "./types.ts";

/** Properties a host may set before the element is upgraded. */
const PROPERTIES = [
  "events",
  "calendars",
  "activeCalendar",
  "hiddenCalendars",
  "lockedCalendars",
  "userEmail",
  "locale",
  "theme",
  "firstDayOfWeek",
  "strings",
  "workHours",
  "busynessMode",
  "expandThreshold",
  "layers",
  "selection",
  "minDate",
  "maxDate",
] as const;


function buildUi() {
  const button = (part: string, text = "") => h("button", { part: `button ${part}`, type: "button" }, text);
  const today = button("today");
  const month = h("span", { part: "month" });
  const zoomLabel = h("span", { part: "zoom-label" });
  const layers = h("div", { part: "layers" });
  const weekdayRow = h("div", { part: "weekday-row" });
  const weekdays = h("div", { part: "weekdays", "aria-hidden": "true" }, weekdayRow);

  const canvas = h("canvas", { part: "canvas" });
  const drop = h("div", { part: "drop-outline" });
  const panel = document.createElement("calendar-event-panel") as CalendarEventPanel;
  panel.setAttribute("part", "panel");
  panel.hidden = true;

  const back = button("icon back", "‹");
  const forward = button("icon forward", "›");
  const monthButton = button("month-button");
  const filter = h("input", { part: "filter", type: "search" });
  const body = h("div", { part: "body" }, canvas, drop, panel);

  const dialogText = h("p", { part: "dialog-text" });
  const dialogCancel = h("button", { part: "button", value: "cancel" });
  const dialogOk = h("button", { part: "button danger", value: "ok", autofocus: true });
  const dialog = h(
    "dialog",
    { part: "dialog" },
    h("form", { method: "dialog" }, dialogText, h("div", { part: "dialog-actions" }, dialogCancel, dialogOk)),
  );
  const dragImage = h("div", { part: "drag-image" });

  const root = h(
    "div",
    { part: "root" },
    h("slot", { name: "sidebar" }),
    h(
      "div",
      { part: "main" },
      h(
        "header",
        { part: "toolbar" },
        h("div", { part: "group" }, back, forward, today, monthButton),
        h("div", { part: "title" }, month, zoomLabel),
        h("div", { part: "group" }, layers, filter),
      ),
      weekdays,
      body,
    ),
    dialog,
    dragImage,
  );

  return {
    root,
    today,
    month,
    zoomLabel,
    layers,
    weekdays,
    weekdayRow,
    body,
    canvas,
    panel,
    back,
    forward,
    monthButton,
    filter,
    dialog,
    dialogText,
    dialogCancel,
    dialogOk,
    dragImage,
  };
}

export interface CalendarView {
  addEventListener<K extends keyof CalendarEventMap>(
    type: K,
    listener: (event: CustomEvent<CalendarEventMap[K]>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}

/**
 * `<calendar-view>`: an endless, zoomable list of week rows. It shows the events it is given and
 * reports what the user wants to change as events; it never changes events itself.
 */
export class CalendarView extends HTMLElement {
  static observedAttributes = ["theme", "locale", "storage-key"];

  readonly model: CalendarModel;
  readonly pointer: PointerController;
  readonly ui = buildUi();
  readonly shadow: ShadowRoot;
  readonly ctx: CanvasRenderingContext2D;
  layerList: Layer[] = defaultLayers;
  tokens: Theme | null = null;
  scene: Scene | null = null;
  size = { width: 0, height: 0 };
  frame = 0;
  minute = -1;
  restored = false;
  gestureZoom = 1;
  cleanup: (() => void)[] = [];
  applied = { strings: null as Strings | null, layers: null as Layer[] | null, weekdays: "", panel: -1, columns: 0 };

  constructor() {
    super();
    this.model = new CalendarModel(
      (type, detail) => this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true })),
      () => this.requestFrame(),
      navigator.language,
    );
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.append(h("style", {}, styles), this.ui.root);
    this.ctx = this.ui.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.pointer = new PointerController(this.model, {
      geo: () => this.geometry(),
      scene: () => (this.scene ??= buildScene(this.model, this.geometry(), new Date())),
      canvas: this.ui.canvas,
      dragImage: this.ui.dragImage,
    });
    this.bind();
    for (const key of PROPERTIES) {
      if (!Object.hasOwn(this, key)) continue;
      const value = (this as Record<string, unknown>)[key];
      delete (this as Record<string, unknown>)[key];
      (this as Record<string, unknown>)[key] = value;
    }
  }

  // Host properties

  get events(): CalendarEvent[] {
    return this.model.events;
  }
  set events(events: CalendarEvent[]) {
    this.model.setEvents(events);
  }

  get calendars(): CalendarInfo[] {
    return [...this.model.calendars.values()];
  }
  set calendars(calendars: CalendarInfo[]) {
    this.model.setCalendars(calendars);
  }

  /** Calendar that new, duplicated and imported events go into. */
  get activeCalendar(): string {
    return this.model.activeCalendar;
  }
  set activeCalendar(id: string) {
    this.model.setActiveCalendar(id);
  }

  get hiddenCalendars(): string[] {
    return [...this.model.hidden];
  }
  set hiddenCalendars(ids: Iterable<string>) {
    this.model.setHidden(ids);
  }

  /** Read-only calendars. */
  get lockedCalendars(): string[] {
    return [...this.model.locked];
  }
  set lockedCalendars(ids: Iterable<string>) {
    this.model.setLocked(ids);
  }

  /** Recognises the user's own invitations. */
  get userEmail(): string {
    return this.model.userEmail;
  }
  set userEmail(email: string) {
    this.model.setUserEmail(email);
  }

  get locale(): string {
    return this.model.locale;
  }
  set locale(locale: string) {
    this.setAttribute("locale", locale);
  }

  get theme(): string | null {
    return this.getAttribute("theme");
  }
  set theme(theme: string) {
    this.setAttribute("theme", theme);
  }

  /** 0 = Sunday. `null` uses the region of the locale. */
  get firstDayOfWeek(): number {
    return this.model.firstDay;
  }
  set firstDayOfWeek(day: number | null) {
    this.model.setFirstDay(day);
  }

  get strings(): Strings {
    return this.model.strings;
  }
  set strings(strings: Partial<Strings>) {
    this.model.setStrings({ ...defaultStrings, ...strings });
  }

  /** First day that can be shown, `null` scrolls endlessly into the past. */
  get minDate(): Date | null {
    return this.model.minDay === null ? null : dateOf(this.model.minDay);
  }
  set minDate(date: Date | null) {
    this.model.setRange(date, this.maxDate);
  }

  /** Last day that can be shown, `null` scrolls endlessly into the future. */
  get maxDate(): Date | null {
    return this.model.maxDay === null ? null : dateOf(this.model.maxDay);
  }
  set maxDate(date: Date | null) {
    this.model.setRange(this.minDate, date);
  }

  get workHours(): [number, number] {
    return this.model.workHours;
  }
  set workHours(hours: [number, number]) {
    this.model.setWorkHours(hours);
  }

  get busynessMode(): BusynessMode {
    return this.model.busynessMode;
  }
  set busynessMode(mode: BusynessMode) {
    this.model.setBusynessMode(mode);
  }

  /** Row height in px from which rows split into an all-day band and a time area. */
  get expandThreshold(): number {
    return this.model.expandAt;
  }
  set expandThreshold(px: number) {
    this.model.setExpandAt(px);
  }

  /** Drawing layers, bottom to top. Add custom layers by extending `defaultLayers`. */
  get layers(): Layer[] {
    return this.layerList;
  }
  set layers(layers: Layer[]) {
    this.layerList = layers;
    this.requestFrame();
  }

  get selection(): string[] {
    return [...this.model.selection];
  }
  set selection(ids: Iterable<string>) {
    this.model.setSelection(ids);
  }

  // Host methods

  goTo(date: Date) {
    this.model.goTo(date);
  }

  goToday() {
    this.model.goToday();
  }

  goMonth() {
    this.model.goMonth();
  }

  back() {
    this.model.back();
  }

  forward() {
    this.model.forward();
  }

  setLayer(id: string, on: boolean) {
    this.model.setLayer(id, on);
  }

  cancelInteraction() {
    this.pointer.cancel();
  }

  appendSummary(id: string, chunk: string) {
    this.model.updateSummary(id, (summary) => ({ ...summary, text: summary.text + chunk }));
  }

  finishSummary(id: string) {
    this.model.updateSummary(id, (summary) => ({ ...summary, status: "done" }));
  }

  failSummary(id: string) {
    this.model.updateSummary(id, (summary) => ({ ...summary, status: "error" }));
  }

  /** Re-reads the CSS variables, for theme changes the element can't observe itself. */
  refreshTheme() {
    this.invalidateTheme();
  }

  // Lifecycle

  connectedCallback() {
    const model = this.model;
    if (!this.restored) {
      this.restored = true;
      model.storageKey = this.getAttribute("storage-key") ?? "calendar-view";
      model.restore();
      model.record();
    }

    const listen = <K extends keyof WindowEventMap>(type: K, listener: (e: WindowEventMap[K]) => void, capture = false) => {
      window.addEventListener(type, listener, capture);
      this.cleanup.push(() => window.removeEventListener(type, listener, capture));
    };
    listen("keydown", this.keyDown);
    listen("keyup", this.keyUp);
    listen("copy", this.copy);
    listen("paste", this.paste);
    listen("pointerdown", this.outsidePointer, true);

    const media = matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => this.invalidateTheme();
    media.addEventListener("change", onMedia);
    const mutations = new MutationObserver(() => this.invalidateTheme());
    mutations.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    mutations.observe(this, { attributes: true, attributeFilter: ["class", "style"] });
    const resize = new ResizeObserver(() => this.resize());
    resize.observe(this.ui.body);
    const clock = setInterval(() => this.tickClock(), 1000);
    this.cleanup.push(
      () => media.removeEventListener("change", onMedia),
      () => mutations.disconnect(),
      () => resize.disconnect(),
      () => clearInterval(clock),
    );
    this.tickClock();
    this.requestFrame();
  }

  disconnectedCallback() {
    for (const dispose of this.cleanup.splice(0)) dispose();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pointer.reset();
    this.model.save();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === "theme") this.invalidateTheme();
    if (name === "locale") this.model.setLocale(value ?? navigator.language);
    if (name === "storage-key") this.model.storageKey = value;
  }

  // Wiring

  bind() {
    const { ui, model, pointer } = this;
    const canvas = ui.canvas;
    canvas.addEventListener("pointerdown", (e) => pointer.down(e));
    canvas.addEventListener("pointermove", (e) => {
      pointer.move(e);
      canvas.style.cursor = pointer.cursor;
    });
    canvas.addEventListener("pointerup", (e) => pointer.up(e));
    canvas.addEventListener("pointercancel", (e) => pointer.pointerCancel(e));
    canvas.addEventListener("pointerleave", () => pointer.leave());
    canvas.addEventListener("dragstart", (e) => pointer.dragStart(e));
    canvas.addEventListener("dragend", () => pointer.dragEnd());

    const body = ui.body;
    body.addEventListener("wheel", (e) => this.wheel(e), { passive: false });
    body.addEventListener("dragover", (e) => this.dragOver(e));
    body.addEventListener("dragleave", (e) => this.dragLeave(e));
    body.addEventListener("drop", (e) => this.drop(e));
    // Safari reports trackpad pinches as gesture events instead of ctrl + wheel.
    type GestureEvent = Event & { scale: number; clientY: number };
    body.addEventListener("gesturestart", (e) => {
      e.preventDefault();
      this.gestureZoom = model.zoom;
    });
    body.addEventListener("gesturechange", (e) => {
      e.preventDefault();
      const gesture = e as GestureEvent;
      model.stopMotion();
      model.zoomAt(this.gestureZoom / gesture.scale, gesture.clientY - canvas.getBoundingClientRect().top);
    });

    ui.today.addEventListener("click", () => model.goToday());
    ui.monthButton.addEventListener("click", () => model.goMonth());
    ui.back.addEventListener("click", () => model.back());
    ui.forward.addEventListener("click", () => model.forward());
    ui.filter.addEventListener("input", () => model.setFilter(ui.filter.value));
    ui.filter.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      ui.filter.value = "";
      model.setFilter("");
      ui.filter.blur();
    });

    ui.panel.addEventListener("panel-change", (e) => {
      const { id, changes } = (e as CustomEvent).detail;
      model.change(id, changes);
    });
    ui.panel.addEventListener("panel-close", () => model.close());
    ui.panel.addEventListener("panel-summarize", () => model.requestSummary());
    ui.panel.addEventListener("panel-respond", (e) => {
      const event = model.openEvent;
      if (event) model.respond(event.id, (e as CustomEvent<ResponseStatus>).detail);
    });

    ui.dialog.addEventListener("click", (e) => {
      if (e.target === ui.dialog) ui.dialog.close("cancel");
    });
  }

  keyDown = (e: KeyboardEvent) => {
    const model = this.model;
    if (e.key === "Shift" || e.key === "Alt" || e.key === "Meta" || e.key === "Control") this.pointer.modifiers(e);
    if (this.ui.dialog.open || isTyping(e)) return;
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === "Escape") {
      if (this.pointer.cancel()) return;
      model.setSelection([]);
      model.close();
    } else if (mod && e.shiftKey && e.key.toLowerCase() === "r") {
      e.preventDefault();
      model.refresh();
    } else if (mod || e.altKey) {
      return;
    } else if (e.key === "t" || e.key === "T") {
      model.goToday();
    } else if ((e.key === "Delete" || e.key === "Backspace") && model.selection.size) {
      e.preventDefault();
      void this.confirmDelete();
    }
  };

  keyUp = (e: KeyboardEvent) => {
    if (e.key === "Shift" || e.key === "Alt" || e.key === "Meta" || e.key === "Control") this.pointer.modifiers(e);
  };

  copy = (e: ClipboardEvent) => {
    if (this.ui.dialog.open || isTyping(e) || getSelection()?.toString()) return;
    const ics = this.model.copy();
    if (!ics || !e.clipboardData) return;
    e.clipboardData.setData("text/calendar", ics);
    e.clipboardData.setData("text/plain", ics);
    e.preventDefault();
  };

  paste = (e: ClipboardEvent) => {
    if (this.ui.dialog.open || isTyping(e) || !e.clipboardData) return;
    const files = [...e.clipboardData.files];
    if (files.length) {
      e.preventDefault();
      this.importFiles(files);
      return;
    }
    const text = e.clipboardData.getData("text/calendar") || e.clipboardData.getData("text/plain");
    if (!isCalendarData(text)) return;
    e.preventDefault();
    this.model.importData(text, null);
  };

  /** A click anywhere outside the canvas and the panel closes the panel. */
  outsidePointer = (e: PointerEvent) => {
    if (!this.model.openId) return;
    const path = e.composedPath();
    if (path.includes(this.ui.panel) || path.includes(this.ui.canvas) || path.includes(this.ui.dialog)) return;
    this.model.close();
  };

  wheel(e: WheelEvent) {
    if (e.composedPath().includes(this.ui.panel)) return;
    e.preventDefault();
    const model = this.model;
    model.stopMotion();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? model.height : 1;
    let dx = e.deltaX * unit;
    let dy = e.deltaY * unit;
    if (e.ctrlKey || e.metaKey) {
      const y = e.clientY - this.ui.canvas.getBoundingClientRect().top;
      model.zoomAt(model.zoom * Math.exp(clamp(dy, -100, 100) * 0.0025), y);
      return;
    }
    if (e.shiftKey && !dx) {
      dx = dy;
      dy = 0;
    }
    model.scrollBy(dx, dy);
  }

  dragOver(e: DragEvent) {
    if (this.pointer.dragOver(e)) return;
    if (!e.dataTransfer?.types.includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    this.ui.body.toggleAttribute("data-drop", true);
  }

  dragLeave(e: DragEvent) {
    if (e.relatedTarget instanceof Node && this.ui.body.contains(e.relatedTarget)) return;
    this.ui.body.removeAttribute("data-drop");
    this.pointer.dragLeave();
  }

  drop(e: DragEvent) {
    this.ui.body.removeAttribute("data-drop");
    if (this.pointer.drop(e)) return;
    const files = [...(e.dataTransfer?.files ?? [])];
    if (!files.length) return;
    e.preventDefault();
    this.importFiles(files);
  }

  importFiles(files: File[]) {
    for (const file of files) {
      if (file.size > MAX_IMPORT_BYTES) {
        this.model.notify(this.model.strings.fileTooLarge(file.name));
        continue;
      }
      void file.text().then((text) => this.model.importData(text, file.name));
    }
  }

  async confirmDelete() {
    const model = this.model;
    const events = model.deletable();
    if (!events.length) return model.notify(model.strings.nothingToDelete);
    if (await this.confirm(model.strings.confirmDelete(events.length))) model.delete(events.map((event) => event.id));
  }

  confirm(text: string): Promise<boolean> {
    const { dialog, dialogText, dialogOk } = this.ui;
    dialogText.textContent = text;
    dialog.returnValue = "";
    dialog.showModal();
    dialogOk.focus();
    return new Promise((resolve) => {
      dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok"), { once: true });
    });
  }

  // Rendering

  themeTokens(): Theme {
    this.tokens ??= readTheme(this);
    return this.tokens;
  }

  invalidateTheme() {
    this.tokens = null;
    if (this.isConnected) this.resize();
  }

  resize() {
    const { clientWidth, clientHeight } = this.ui.body;
    const theme = this.themeTokens();
    this.size = { width: clientWidth, height: clientHeight };
    this.model.setViewport(Math.max(0, clientWidth - theme.gutterWidth - theme.stripWidth), clientHeight);
    this.requestFrame();
  }

  geometry(): Geometry {
    const theme = this.themeTokens();
    const model = this.model;
    return {
      width: this.size.width,
      height: this.size.height,
      gutter: theme.gutterWidth,
      strip: theme.stripWidth,
      colWidth: model.colWidth,
      colsX: theme.gutterWidth - model.scrollX,
      scrollTop: model.scrollTop,
      expandAt: model.expandAt,
      bandRatio: BAND_RATIO,
    };
  }

  requestFrame() {
    if (this.frame || !this.isConnected) return;
    this.frame = requestAnimationFrame((time) => this.paint(time));
  }

  paint(time: number) {
    this.frame = 0;
    if (!this.size.width || !this.size.height) return;
    const { model, ctx, ui } = this;
    const theme = this.themeTokens();
    model.tick(time);
    const scrolling = this.pointer.frame();
    this.pointer.reconcile();
    const geo = this.geometry();
    const scene = buildScene(model, geo, new Date());
    this.scene = scene;

    const dpr = devicePixelRatio;
    const width = Math.round(geo.width * dpr);
    const height = Math.round(geo.height * dpr);
    if (ui.canvas.width !== width || ui.canvas.height !== height) {
      ui.canvas.width = width;
      ui.canvas.height = height;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, geo.width, geo.height);

    const paint: Paint = { ctx, scene, theme, model };
    const layers = this.layerList.filter((layer) => !layer.toggleable || !model.disabledLayers.has(layer.id));
    ctx.save();
    ctx.beginPath();
    ctx.rect(geo.gutter, 0, geo.width - geo.gutter - geo.strip, geo.height);
    ctx.clip();
    for (const layer of layers) {
      ctx.save();
      layer.draw(paint);
      ctx.restore();
    }
    ctx.restore();
    for (const layer of layers) {
      if (!layer.overlay) continue;
      ctx.save();
      layer.overlay(paint);
      ctx.restore();
    }
    drawStrip(paint);

    this.syncChrome(scene);
    if (model.moving || scrolling) this.requestFrame();
  }

  syncChrome(scene: Scene) {
    const { model, ui } = this;
    const strings = model.strings;
    if (this.applied.strings !== strings || this.applied.layers !== this.layerList) this.applyStrings();
    const weekdays = `${model.locale}|${model.firstDay}`;
    if (this.applied.weekdays !== weekdays) this.renderWeekdays(weekdays);
    if (this.applied.columns !== model.colWidth) {
      this.applied.columns = model.colWidth;
      ui.weekdays.style.setProperty("--cal-column-width", `${model.colWidth}px`);
    }
    ui.weekdayRow.style.transform = `translateX(${-model.scrollX}px)`;

    setText(ui.month, model.formats.monthYear(dateOf(weekStart(Math.floor(model.centerWeek), model.firstDay) + 3)));
    setText(ui.zoomLabel, strings.zoomLevels[model.zoomLevel]);
    ui.back.disabled = !model.canBack;
    ui.forward.disabled = !model.canForward;
    for (const chip of ui.layers.querySelectorAll<HTMLElement>("[data-layer]")) {
      chip.setAttribute("aria-pressed", String(!model.disabledLayers.has(chip.dataset.layer as string)));
    }

    this.syncPanel(scene);
  }

  syncPanel(scene: Scene) {
    const { model } = this;
    const panel = this.ui.panel;
    const event = model.openEvent;
    if (!event) {
      if (panel.data) panel.clear();
      panel.hidden = true;
      return;
    }
    if (this.applied.panel !== model.version || panel.data?.event !== event) {
      panel.show(model.panelData(event));
      this.applied.panel = model.version;
    }
    panel.hidden = false;
    const { geo } = scene;
    const anchor = anchorOf(model, scene, event);
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const right = geo.width - geo.strip;
    let x = anchor.x + anchor.w + 8;
    if (x + width > right - 4) x = anchor.x - 8 - width;
    x = Math.max(geo.gutter + 4, Math.min(x, right - width - 4));
    const y = clamp(anchor.y, 4, Math.max(4, geo.height - height - 4));
    panel.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  tickClock() {
    const now = new Date();
    if (now.getMinutes() === this.minute) return;
    this.minute = now.getMinutes();
    this.requestFrame();
  }

  applyStrings() {
    const { ui, model } = this;
    const strings = model.strings;
    ui.today.textContent = strings.today;
    ui.monthButton.textContent = strings.month;
    for (const [button, label] of [
      [ui.back, strings.back],
      [ui.forward, strings.forward],
    ] as const) {
      button.title = label;
      button.setAttribute("aria-label", label);
    }
    ui.filter.placeholder = strings.filter;
    ui.filter.setAttribute("aria-label", strings.filter);
    ui.layers.replaceChildren(
      ...this.layerList
        .filter((layer) => layer.toggleable)
        .map((layer) =>
          h(
            "button",
            {
              part: "layer",
              type: "button",
              "data-layer": layer.id,
              style: `--dot: var(--cal-layer-${layer.id}, var(--cal-accent))`,
              "aria-pressed": "true",
              title: layer.label(strings),
              "aria-label": layer.label(strings),
              onclick: () => model.setLayer(layer.id, model.disabledLayers.has(layer.id)),
            },
            h("span", { part: "layer-label" }, layer.label(strings)),
          ),
        ),
    );
    ui.dialogCancel.textContent = strings.cancel;
    ui.dialogOk.textContent = strings.delete;
    this.applied.strings = strings;
    this.applied.layers = this.layerList;
  }

  renderWeekdays(key: string) {
    const model = this.model;
    const first = weekStart(0, model.firstDay);
    this.ui.weekdayRow.replaceChildren(
      ...Array.from({ length: 7 }, (_, col) =>
        h(
          "div",
          { part: "weekday", "data-weekend": isWeekend(first + col) },
          model.formats.weekdayShort(dateOf(first + col)),
        ),
      ),
    );
    this.applied.weekdays = key;
  }
}

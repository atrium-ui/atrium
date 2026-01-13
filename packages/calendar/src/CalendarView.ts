import { LitElement, css, html, render } from "lit";
import { CalendarInternal } from "./CalendarInternal.js";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

interface WeekInfo {
  weekNumber: number;
  year: number;
  days: Date[];
  yOffset: number;
  height: number;
}

interface VisibleMonth {
  name: string;
  year: number;
  yStart: number;
  yOffset: number;
}

const MIN_DAY_HEIGHT = 100;
const MAX_DAY_HEIGHT = 2000; // 1px per minute
const LEFT_GUTTER_WIDTH = 60;
const MIN_EVENT_HEIGHT = 20;

export class CalendarViewElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family:
        system-ui,
        -apple-system,
        sans-serif;
      --grid-color: rgba(255, 255, 255, 0.1);
      --text-color: rgba(255, 255, 255, 0.9);
      --text-muted: rgba(255, 255, 255, 0.4);
      --today-bg: rgba(255, 255, 255, 0.05);
      --selection-bg: rgba(100, 100, 255, 0.3);
      --event-default: #9b59b6;
    }

    ::-webkit-scrollbar {
      display: none;
    }

    .container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .filter-bar {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 10;
    }

    .filter-input {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid var(--grid-color);
      color: var(--text-color);
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
    }

    .filter-input:focus {
      border-color: var(--text-color);
    }

    .header {
      display: flex;
      height: 32px;
      border-bottom: 1px solid var(--grid-color);
      flex-shrink: 0;
    }

    .header-gutter {
      width: 60px;
      flex-shrink: 0;
    }

    .weekdays {
      display: flex;
      flex: 1;
    }

    .weekday {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .body {
      position: relative;
      flex: 1;
      overflow: hidden;
    }

    .canvas-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    .scroll-container {
      position: absolute;
      inset: 0;
      overflow-y: overlay;
      overflow-x: hidden;
      z-index: 1;
      cursor: default;
      overflow-anchor: none;
    }

    .scroll-container.zoom-cursor {
      cursor: ns-resize;
    }

    .scroll-content {
      position: relative;
      pointer-events: none;
    }

    .events-layer {
      position: absolute;
      top: 0;
      left: 60px;
      right: 0;
      pointer-events: none;
    }

    .overlay-layer {
      position: absolute;
      inset: 0;
      left: 60px;
      right: 12px;
      pointer-events: none;
      z-index: 2;
      overflow: hidden;
    }

    .minimap {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 12px;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 10;
      cursor: pointer;
      display: block;
    }

    .event {
      position: absolute;
      background: var(--event-default);
      opacity: 0.75;
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 11px;
      color: white;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      pointer-events: auto;
      cursor: pointer;
      box-sizing: border-box;
      border-bottom: 3px solid rgba(0, 0, 0, 0.3);
      transition: filter 0.1s ease;
    }

    .event:hover,
    .event.hovered {
      filter: brightness(1.2);
      opacity: 1;
    }

    .event.span-start {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .event.span-end {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    .event.span-middle {
      border-radius: 0;
    }

    .month-label {
      position: absolute;
      font-size: 24px;
      font-weight: 500;
      color: var(--text-color);
      z-index: 5;
      pointer-events: none;
      white-space: nowrap;
      padding: 12px 0 0 12px;
      text-shadow: 2px 4px 12px #000000cc;
    }

    .selection {
      position: absolute;
      background: var(--selection-bg);
      border: 0.5px solid rgba(100, 100, 255, 0.5);
      pointer-events: none;
    }

    .date-label {
      position: absolute;
      font-size: 16px;
      color: var(--text-muted);
      padding: 2px 18px;
      text-align: right;
      box-sizing: border-box;
    }
  `;

  _events: CalendarEvent[] = [];

  set events(value: CalendarEvent[]) {
    this._events = value;

    this.updateFilter();
    this.requestUpdate();
  }
  get events() {
    return this._events;
  }

  _filter = "";

  set filter(newFilter) {
    const previousFilter = this.filter;

    const wasFiltered = previousFilter && previousFilter.trim().length > 0;
    const isFiltered = newFilter && newFilter.trim().length > 0;

    this._filter = newFilter;

    // If filter was just cleared/reset (was filtered, now empty)
    if (wasFiltered && !isFiltered) {
      this.updateWeekOffsets();
      this.renderCanvas();
      // Restore after render completes
      this.restoreFilterScrollState();
    }
    // If filter was just applied (was empty, now filtered)
    else if (!wasFiltered && isFiltered) {
      this.saveFilterScrollState();
      this.updateWeekOffsets();
      this.renderCanvas();
    } else {
      this.updateWeekOffsets();
      this.renderCanvas();
    }

    this.requestUpdate();
  }
  get filter() {
    return this._filter;
  }

  locale: string = navigator.language;

  /**
   * First day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
   * Defaults to locale-appropriate value.
   */
  weekStart?: number;

  _dayHeight = MIN_DAY_HEIGHT;

  set dayHeight(value) {
    this._dayHeight = value;

    this.saveDayHeight();
    this.updateWeekOffsets();
    this.renderCanvas();
  }
  get dayHeight() {
    return this._dayHeight;
  }

  _scrollTop = 0;

  set scrollTop(value) {
    this._scrollTop = value;

    if(this.scrollContainer.scrollHeight < value) {
      this.scrollContent.style.minHeight = (value + window.innerHeight) + "px";
    }

    this.scrollContainer.scrollTop = value;

    this.saveScrollPosition();
    this.renderCanvas();
  }
  get scrollTop() {
    return this._scrollTop;
  }

  onScroll = (): void => {
    if (this.scrollContainer) {
      this._scrollTop = this.scrollContainer.scrollTop;

      this.saveScrollPosition();
      this.renderCanvas();
    }
  };

  viewportHeight = 0;

  selection: { startX: number; startY: number; endX: number; endY: number } | null = null;

  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  scrollContainer: HTMLElement | null = null;
  scrollContent: HTMLElement | null = null;
  resizeObserver: ResizeObserver | null = null;
  weeks: WeekInfo[] = [];
  totalHeight = 0;
  isDraggingZoom = false;
  zoomDragStartY = 0;
  zoomDragStartHeight = 0;
  zoomOriginY = 0; // Y position in content coordinates (scroll + viewport offset)
  zoomViewportY = 0; // Y position in viewport where zoom started
  isSelecting = false;
  selectionStartX = 0;
  selectionStartY = 0;
  animationFrame: number | null = null;
  isDraggingMinimap = false;
  preFilterScrollTop = 0; // Stores scroll position before filtering
  timeUpdateInterval: ReturnType<typeof setInterval> | null = null;

  // Generate weeks for a year range centered on current date
  startDate = new Date();
  endDate = CalendarInternal.addDays(new Date(), 365);
  utils = new CalendarInternal({ locale: this.locale, weekStart: this.weekStart });

  loadDayHeight(): number {
    const saved = localStorage.getItem("calendar-dayHeight");
    if (saved) {
      return Math.max(MIN_DAY_HEIGHT, Math.min(MAX_DAY_HEIGHT, parseFloat(saved)));
    }

    return MIN_DAY_HEIGHT;
  }

  saveDayHeight(): void {
    localStorage.setItem("calendar-dayHeight", this.dayHeight.toString());
  }

  saveScrollPosition(): void {
    localStorage.setItem("calendar-scrollTop", this.scrollTop.toString());
  }

  loadScrollPosition() {
    const savedScroll = localStorage.getItem("calendar-scrollTop");
    if (savedScroll) {
      const scrollPos = parseFloat(savedScroll);
      this.scrollTop = scrollPos;
    } else {
      this.updateWeekOffsets();

      // Scroll to today if no saved position
      const today = new Date();
      const weekIndex = this.weeks.findIndex(w =>
        w.days.some(d => CalendarInternal.isSameDay(d, today)),
      );
      if (weekIndex >= 0) {
        const targetWeek = this.weeks[weekIndex];
        if (targetWeek) {
          const targetScroll = targetWeek.yOffset - this.viewportHeight / 2;
          this.scrollTop = Math.max(0, targetScroll);
        }
      }
    }
  }

  saveFilterScrollState(): void {
    // Save the current scroll position before applying filter
    this.preFilterScrollTop = this.scrollTop;
  }

  restoreFilterScrollState(): void {
    // Restore scroll position after clearing filter
    // Use requestAnimationFrame to ensure layout has updated
    requestAnimationFrame(() => {
      if (this.scrollContainer) {
        const clampedScroll = Math.max(
          0,
          Math.min(this.preFilterScrollTop, this.totalHeight - this.viewportHeight),
        );
        this.scrollTop = clampedScroll;
      }
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.locale = this.getAttribute("locale") || this.locale;
    this.weekStart = Number(this.getAttribute("week-start")) || this.weekStart;

    this.handleUpdateLocale();

    this.startDate = this.utils.getStartOfWeek(CalendarInternal.addDays(new Date(), -365));
    this.generateWeeks();

    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("wheel", this.onWheel, { passive: false });

    // Update current time indicator every 10 seconds
    this.timeUpdateInterval = setInterval(() => {
      this.renderCanvas();
    }, 10000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("wheel", this.onWheel);
    this.resizeObserver?.disconnect();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  firstUpdated(): void {
    this.canvas = this.renderRoot.querySelector("canvas");
    this.scrollContainer = this.renderRoot.querySelector(".scroll-container");
    this.scrollContent = this.renderRoot.querySelector(".scroll-content");
    this.ctx = this.canvas?.getContext("2d") ?? null;

    // Restore zoom level from localStorage
    const savedDayHeight = this.loadDayHeight();
    if (savedDayHeight !== 80) {
      this.dayHeight = savedDayHeight;
    }

    // Try to restore saved scroll position, otherwise scroll to today
    this.loadScrollPosition();

    if (this.scrollContainer) {
      this.scrollContainer.addEventListener("scroll", this.onScroll);
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this);

    this.handleResize();
    this.renderCanvas();
  }

  updateFilter() {
    this.filter = this.getAttribute("filter") || this.filter;
  }

  handleUpdateLocale() {
    this.utils = new CalendarInternal({ locale: this.locale, weekStart: this.weekStart });
    this.startDate = this.utils.getStartOfWeek(CalendarInternal.addDays(new Date(), -365));
    this.generateWeeks();
    this.renderCanvas();
  }

  generateWeeks(): void {
    this.weeks = this.utils.generateWeeks(this.startDate, this.endDate);
  }

  updateWeekOffsets(): void {
    let y = 0;

    if (this.filter) {
      const filteredEvents = this.getFilteredEvents();

      // Pre-compute event date ranges once (avoiding repeated startOfDayTime/endOfDayTime calls)
      const eventRanges = filteredEvents.map(e => ({
        start: CalendarInternal.startOfDayTime(e.start),
        end: CalendarInternal.endOfDayTime(e.end),
      }));

      for (const week of this.weeks) {
        week.yOffset = y;

        // Check if any day in this week overlaps any event range
        const weekStartTime = week.days[0]?.getTime() ?? 0;
        const weekEndTime = week.days[6]?.getTime() ?? 0;

        // Quick check: skip if week is entirely outside all event ranges
        const hasEvents = eventRanges.some(
          range => range.end >= weekStartTime && range.start <= weekEndTime,
        );

        week.height = hasEvents ? this.dayHeight : 0;
        y += week.height;
      }
    } else {
      for (const week of this.weeks) {
        week.yOffset = y;
        week.height = this.dayHeight;
        y += week.height;
      }
    }

    this.totalHeight = y;
  }

  getFilteredEvents(): CalendarEvent[] {
    if (!this.filter) return this.events;
    const f = this.filter.toLowerCase();
    return this.events.filter(e => e.title.toLowerCase().includes(f));
  }

  handleResize(): void {
    if (!this.canvas || !this.scrollContainer) return;

    const rect = this.scrollContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.viewportHeight = rect.height;

    // Reset and rescale context (scale is reset when canvas dimensions change)
    this.ctx = this.canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }

    this.renderCanvas();
  }

  renderCanvas(): void {
    if (!this.ctx || !this.canvas || !this.scrollContainer) return;

    const ctx = this.ctx;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);

    const scrollTop = this.scrollTop;
    const gridWidth = width - LEFT_GUTTER_WIDTH;
    const dayWidth = gridWidth / 7;
    const today = new Date();

    // Find visible weeks
    const visibleWeeks = this.weeks.filter(
      w =>
        w.height > 0 &&
        w.yOffset + w.height > scrollTop &&
        w.yOffset < scrollTop + height,
    );

    // Draw today highlight and current time indicator
    for (const week of visibleWeeks) {
      const todayIndex = week.days.findIndex(d => CalendarInternal.isSameDay(d, today));
      if (todayIndex >= 0) {
        const x = LEFT_GUTTER_WIDTH + todayIndex * dayWidth;
        const y = week.yOffset - scrollTop;
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.fillRect(x, y, dayWidth, week.height);

        // Draw current time indicator line
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const timeY = y + (currentMinutes / 1440) * week.height;
        if (timeY >= 0 && timeY <= height) {
          ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, timeY);
          ctx.lineTo(x + dayWidth, timeY);
          ctx.stroke();
          ctx.lineWidth = 1;
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Vertical lines (day separators)
    for (let i = 0; i <= 7; i++) {
      const x = LEFT_GUTTER_WIDTH + i * dayWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines (week separators) and left gutter content
    ctx.font = "12px monospace, system-ui, sans-serif";

    for (let i = 0; i < visibleWeeks.length; i++) {
      const week = visibleWeeks[i];
      if (!week) continue;
      const y = week.yOffset - scrollTop;

      // Draw gap indicator if there are hidden weeks before this one
      if (this.filter && i > 0) {
        const prevWeek = visibleWeeks[i - 1];
        if (!prevWeek) continue;
        const prevWeekIndex = this.weeks.indexOf(prevWeek);
        const currentWeekIndex = this.weeks.indexOf(week);
        const hiddenWeeks = currentWeekIndex - prevWeekIndex - 1;

        if (hiddenWeeks > 0) {
          // Draw gap indicator at the top of the current week
          const gapY = y;

          // Draw dashed line
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(LEFT_GUTTER_WIDTH, gapY);
          ctx.lineTo(width, gapY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw ellipsis in the center
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.font = "12px monospace, system-ui, sans-serif";
          ctx.textAlign = "center";
          const ellipsisText = `⋯ ${hiddenWeeks} week${hiddenWeeks > 1 ? "s" : ""} ⋯`;

          // Draw background pill for the ellipsis
          const textWidth = ctx.measureText(ellipsisText).width;
          const pillPadding = 8;
          const pillX = (LEFT_GUTTER_WIDTH + width) / 2 - textWidth / 2 - pillPadding;
          const pillY = gapY - 8;
          const pillWidth = textWidth + pillPadding * 2;
          const pillHeight = 16;

          ctx.fillStyle = "rgba(30, 30, 30, 0.9)";
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 8);
          ctx.fill();

          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.fillText(ellipsisText, (LEFT_GUTTER_WIDTH + width) / 2, gapY + 4);
        }
      }

      // Week separator line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(LEFT_GUTTER_WIDTH, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Left gutter: week number and time scale
      const hourLabelOpacity = Math.max(0, Math.min(1, (this.dayHeight - 300) / 300));

      ctx.textAlign = "right";

      // Draw hourly lines and labels
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * hourLabelOpacity})`;

      // Calculate opacity for hour labels based on zoom level
      // Fade in as we zoom in from 200px to 400px
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * hourLabelOpacity})`;

      for (let hour = 0; hour < 24; hour++) {
        const hourY = y + (hour / 24) * week.height;
        if (hourY >= 0 && hourY <= height) {
          // Hour line
          ctx.beginPath();
          ctx.moveTo(LEFT_GUTTER_WIDTH, hourY);
          ctx.lineTo(width, hourY);
          ctx.stroke();

          // Hour label (only draw if opacity is significant)
          if (hourLabelOpacity > 0.1) {
            const label = `${hour.toString().padStart(2, "0")}:00`;
            ctx.fillText(label, 48, hourY + 4);
          }
        }
      }

      // Draw week number - sticky within visible portion of week
      // Fade out week numbers as we zoom in from 150px to 200px
      const weekNumberOpacity = Math.max(0, Math.min(1, 1 - (this.dayHeight - 300) / 50));
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * weekNumberOpacity})`;
      ctx.textAlign = "center";
      const label = `W${week.weekNumber}`;
      const weekTop = y;
      const weekBottom = y + week.height;
      // Clamp label to be visible: at least 14px from top of viewport,
      // but within the week's bounds
      const labelY = Math.max(
        14,
        Math.min(weekTop + week.height / 2 + 4, weekBottom - 4),
      );
      // Only draw if the label position is within the week's visible area and viewport and opacity is significant
      if (
        labelY >= Math.max(0, weekTop + 4) &&
        labelY <= Math.min(height, weekBottom) &&
        weekNumberOpacity > 0.1
      ) {
        ctx.fillText(label, 30, labelY);
      }
    }

    this.requestUpdate();
  }

  onWheel = (e: WheelEvent): void => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const isZoomKey = isMac ? e.metaKey : e.ctrlKey;

    if (!isZoomKey || !this.scrollContainer) {
      this.updateMousePosition();
      return;
    }

    e.preventDefault();

    const delta = e.deltaY * (this.dayHeight / 100);
    const newHeight = Math.max(
      MIN_DAY_HEIGHT,
      Math.min(MAX_DAY_HEIGHT, this.dayHeight - delta),
    );

    const oldHeight = this.dayHeight;
    this.dayHeight = newHeight;

    // Adjust scroll to keep zoom origin in place
    const scaleRatio = newHeight / oldHeight;

    // Calculate where the origin point is now after scaling
    const newOriginY = this.zoomOriginY * scaleRatio;

    // Adjust scroll so that point stays at the same viewport position (where drag started)
    this.scrollTop = newOriginY - this.zoomViewportY;
    this.zoomOriginY = newOriginY;
  };

  lastPointerY = 0;

  onZoomHandleMouseDown = (e: MouseEvent): void => {
    if (!this.scrollContainer) return;
    e.preventDefault();
    this.isDraggingZoom = true;
    this.zoomDragStartY = e.clientY;
    this.zoomDragStartHeight = this.dayHeight;

    // Store the Y position in content coordinates as zoom origin
    const rect = this.scrollContainer.getBoundingClientRect();
    const viewportY = e.clientY - rect.top;
    this.zoomViewportY = viewportY;
    this.zoomOriginY = viewportY + this.scrollTop;

    this.lastPointerY = e.clientY;
  };

  onMouseMove = (e: MouseEvent): void => {
    if (this.isDraggingMinimap) {
      this.onMinimapMouseMove(e);
    }

    if (this.isDraggingZoom && this.scrollContainer) {
      let deltaY = 0;
      if (this.lastPointerY) {
        deltaY = e.clientY - this.lastPointerY;
      }

      const delta = deltaY * (this.dayHeight / 100);

      const newHeight = Math.max(
        MIN_DAY_HEIGHT,
        Math.min(MAX_DAY_HEIGHT, this.dayHeight - delta),
      );

      const oldHeight = this.dayHeight;
      this.dayHeight = newHeight;

      // Adjust scroll to keep zoom origin in place
      const scaleRatio = newHeight / oldHeight;

      // Calculate where the origin point is now after scaling
      const newOriginY = this.zoomOriginY * scaleRatio;

      // Adjust scroll so that point stays at the same viewport position (where drag started)
      this.scrollTop = newOriginY - this.zoomViewportY;
      this.zoomOriginY = newOriginY;
    } else {
      this.updateMousePosition(e);
    }

    if (this.isSelecting && this.scrollContainer) {
      const rect = this.scrollContainer.getBoundingClientRect();
      this.selection = {
        startX: this.selectionStartX,
        startY: this.selectionStartY,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top + this.scrollTop,
      };
      this.requestUpdate();
    }

    this.lastPointerY = e.clientY;
  };

  updateMousePosition(e?: PointerEvent | MouseEvent) {
    if (this.scrollContainer) {
      // Store the Y position in content coordinates as zoom origin
      const rect = this.scrollContainer.getBoundingClientRect();
      const viewportY = (e?.clientY || this.lastPointerY) - rect.top;
      this.zoomViewportY = viewportY;
      this.zoomOriginY = viewportY + this.scrollTop;
    }
  }

  onMouseUp = (): void => {
    if (this.isDraggingZoom) {
      this.isDraggingZoom = false;
    }
    if (this.isDraggingMinimap) {
      this.isDraggingMinimap = false;
    }
    if (this.isSelecting && this.selection) {
      this.handleSelectionComplete();
      this.isSelecting = false;
      this.selection = null;
      this.requestUpdate();
    }
  };

  onScrollContainerMouseMove = (e: MouseEvent): void => {
    if (!this.scrollContainer || this.isDraggingZoom) return;

    const rect = this.scrollContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < LEFT_GUTTER_WIDTH) {
      this.scrollContainer.classList.add("zoom-cursor");
    } else {
      this.scrollContainer.classList.remove("zoom-cursor");
    }
  };

  onMinimapMouseDown = (e: MouseEvent): void => {
    if (!this.scrollContainer) return;
    e.preventDefault();
    this.isDraggingMinimap = true;
    this.scrollToMinimapPosition(e);
  };

  onMinimapMouseMove = (e: MouseEvent): void => {
    if (!this.isDraggingMinimap || !this.scrollContainer) return;
    this.scrollToMinimapPosition(e);
  };

  scrollToMinimapPosition(e: MouseEvent): void {
    if (!this.scrollContainer) return;
    const minimap = this.renderRoot.querySelector(".minimap");
    if (!minimap) return;

    const rect = minimap.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ratio = y / rect.height;
    const targetScroll = ratio * this.totalHeight - this.viewportHeight / 2;
    this.scrollTop = Math.max(
      0,
      Math.min(targetScroll, this.totalHeight - this.viewportHeight),
    );
  }

  onCanvasMouseDown = (e: MouseEvent): void => {
    if (!this.scrollContainer) return;

    const rect = this.scrollContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + this.scrollTop;

    // Check if clicking on zoom handle area (left gutter)
    if (x < LEFT_GUTTER_WIDTH) {
      this.onZoomHandleMouseDown(e);
      return;
    }

    // Start selection (coordinates are absolute, accounting for scrollTop)
    e.preventDefault();
    this.isSelecting = true;
    this.selectionStartX = x;
    this.selectionStartY = y;
    this.selection = {
      startX: this.selectionStartX,
      startY: this.selectionStartY,
      endX: this.selectionStartX,
      endY: this.selectionStartY,
    };
  };

  handleSelectionComplete(): void {
    if (!this.selection || !this.scrollContainer) return;

    const rect = this.scrollContainer.getBoundingClientRect();
    const gridWidth = rect.width - LEFT_GUTTER_WIDTH;
    const dayWidth = gridWidth / 7;

    const minX = Math.min(this.selection.startX, this.selection.endX);
    const maxX = Math.max(this.selection.startX, this.selection.endX);
    const minY = Math.min(this.selection.startY, this.selection.endY);
    const maxY = Math.max(this.selection.startY, this.selection.endY);

    // Find the days covered by selection
    const startDayIndex = Math.floor((minX - LEFT_GUTTER_WIDTH) / dayWidth);
    const endDayIndex = Math.floor((maxX - LEFT_GUTTER_WIDTH) / dayWidth);

    // Find the weeks covered
    const startWeek = this.weeks.find(
      w => w.yOffset <= minY && w.yOffset + w.height > minY,
    );
    const endWeek = this.weeks.find(
      w => w.yOffset <= maxY && w.yOffset + w.height > maxY,
    );

    if (startWeek && endWeek) {
      const startDateDay = startWeek.days[Math.max(0, Math.min(6, startDayIndex))];
      const endDateDay = endWeek.days[Math.max(0, Math.min(6, endDayIndex))];
      if (!startDateDay || !endDateDay) return;

      // Calculate time if zoomed in enough
      let startHour = 0;
      let endHour = 23;
      if (this.dayHeight >= 200) {
        const startOffsetInWeek = minY - startWeek.yOffset;
        const endOffsetInWeek = maxY - endWeek.yOffset;
        startHour = Math.floor((startOffsetInWeek / startWeek.height) * 24);
        endHour = Math.ceil((endOffsetInWeek / endWeek.height) * 24);
      }

      const start = new Date(startDateDay);
      start.setHours(startHour, 0, 0, 0);
      const end = new Date(endDateDay);
      end.setHours(endHour, 0, 0, 0);

      this.dispatchEvent(
        new CustomEvent("selection", {
          detail: { start, end },
          bubbles: true,
        }),
      );
    }
  }

  onFilterInput = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    this.filter = input.value;
  };

  getVisibleMonths(): VisibleMonth[] {
    const scrollTop = this.scrollTop;
    const height = this.viewportHeight;
    const months: VisibleMonth[] = [];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (const week of this.weeks) {
      if (week.height === 0) continue;
      if (week.yOffset + week.height < scrollTop) continue;
      if (week.yOffset > scrollTop + height) break;

      // Check first day of week for month boundary
      const firstDay = week.days[0];
      if (!firstDay) continue;
      if (firstDay.getDate() <= 7) {
        const monthIndex = firstDay.getMonth();
        const monthName = monthNames[monthIndex];
        if (!monthName) continue;
        const year = firstDay.getFullYear();
        const key = `${monthName}-${year}`;
        const existingMonth = months.find(m => `${m.name}-${m.year}` === key);
        if (!existingMonth) {
          months.push({
            name: monthName,
            year,
            yStart: week.yOffset - scrollTop,
            yOffset: week.yOffset,
          });
        }
      }
    }

    return months;
  }

  renderEvents(): ReturnType<typeof html> {
    if (!this.scrollContainer) return html``;

    const gridWidth = this.scrollContent.clientWidth - LEFT_GUTTER_WIDTH;
    const dayWidth = gridWidth / 7;
    const events = this.getFilteredEvents();
    const scrollTop = this.scrollTop;
    const viewportBottom = scrollTop + this.viewportHeight;
    const showTimeScale = this.dayHeight >= 300;

    const eventElements: ReturnType<typeof html>[] = [];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Filter to visible weeks only
    const visibleWeeks = this.weeks.filter(
      w =>
        w.height > 0 && w.yOffset + w.height >= scrollTop && w.yOffset <= viewportBottom,
    );

    if (visibleWeeks.length === 0) return html``;

    // Compute visible date range (timestamps for fast comparison)
    const firstVisibleWeek = visibleWeeks[0]!;
    const lastVisibleWeek = visibleWeeks[visibleWeeks.length - 1]!;
    const firstVisibleDay = firstVisibleWeek.days[0]!;
    const lastVisibleDay = lastVisibleWeek.days[6]!;
    const visibleStartTime = firstVisibleDay.getTime();
    const visibleEndTime = lastVisibleDay.getTime() + 86400000 - 1;

    // Collect month boundaries from visible weeks only
    const monthBoundaries: {
      monthKey: string;
      monthName: string;
      year: number;
      yOffset: number;
    }[] = [];
    const seenMonths = new Set<string>();

    for (const week of visibleWeeks) {
      const firstDay = week.days[0];
      if (!firstDay) continue;

      const monthIndex = firstDay.getMonth();
      const year = firstDay.getFullYear();
      const monthKey = `${monthIndex}-${year}`;

      if (!seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        const monthName = monthNames[monthIndex];
        if (monthName) {
          monthBoundaries.push({ monthKey, monthName, year, yOffset: week.yOffset });
        }
      }
    }

    // Render month labels with sticky behavior
    for (let i = 0; i < monthBoundaries.length; i++) {
      const month = monthBoundaries[i]!;
      const nextMonth = monthBoundaries[i + 1];
      const labelY = month.yOffset;
      const nextMonthY = nextMonth ? nextMonth.yOffset : this.totalHeight;

      if (nextMonthY < scrollTop) continue;
      if (labelY > viewportBottom) break;

      const stickyTop = Math.max(0, scrollTop - labelY);
      const maxStickyTop = nextMonthY - labelY - 24;
      const clampedStickyTop = Math.min(stickyTop, maxStickyTop);
      const finalTop = labelY + clampedStickyTop;

      eventElements.push(html`
        <div
          class="month-label"
          style="
            top: ${finalTop}px;
            left: 2px;
          "
        >
          ${month.monthName} ${month.year}
        </div>
      `);
    }

    // Track occupied row slots per day-column for stacking
    // Key: `weekIndex-dayIndex`, Value: Set of occupied row indices
    const dayOccupiedRows = new Map<string, Set<number>>();
    // Track assigned row for each event segment (so multi-day events use same row)
    // Key: `weekIndex-eventId`, Value: assigned row index
    const eventRowIndex = new Map<string, number>();

    // Compute event segments per week
    interface EventSegment {
      event: CalendarEvent;
      weekIndex: number;
      week: WeekInfo;
      startDayIndex: number; // 0-6 within week
      endDayIndex: number; // 0-6 within week
      isStart: boolean; // Is this the first segment of the event?
      isEnd: boolean; // Is this the last segment of the event?
      totalWeeks: number; // Total weeks this event spans
    }

    const segments: EventSegment[] = [];

    // Helper to get day index (0-6) within a week for a given date
    const getDayIndexInWeek = (week: WeekInfo, date: Date): number => {
      const dateStart = new Date(date).setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const weekDay = week.days[i];
        if (weekDay && new Date(weekDay).setHours(0, 0, 0, 0) === dateStart) {
          return i;
        }
      }
      // Date is before or after this week
      const weekStart = new Date(week.days[0]!).setHours(0, 0, 0, 0);
      if (dateStart < weekStart) return 0;
      return 6;
    };

    for (const event of events) {
      const eventStartTime = event.start.getTime();
      const eventEndTime = event.end.getTime();

      // Skip events entirely outside visible range
      if (eventEndTime < visibleStartTime || eventStartTime > visibleEndTime) continue;

      // Find all weeks this event spans
      const eventWeeks: { weekIndex: number; week: WeekInfo }[] = [];
      for (let i = 0; i < this.weeks.length; i++) {
        const week = this.weeks[i]!;
        if (week.height === 0) continue;

        const weekStart = new Date(week.days[0]!).setHours(0, 0, 0, 0);
        const weekEnd = new Date(week.days[6]!).setHours(23, 59, 59, 999);

        // Check if event overlaps this week
        if (eventEndTime >= weekStart && eventStartTime <= weekEnd) {
          eventWeeks.push({ weekIndex: i, week });
        }

        // Optimization: stop if we've passed the event's end
        if (weekStart > eventEndTime) break;
      }

      const totalWeeks = eventWeeks.length;

      // Create a segment for each week the event spans
      for (let i = 0; i < eventWeeks.length; i++) {
        const { weekIndex, week } = eventWeeks[i]!;

        // Check if this week is visible
        if (week.yOffset + week.height < scrollTop || week.yOffset > viewportBottom)
          continue;

        const isStart = i === 0;
        const isEnd = i === eventWeeks.length - 1;

        // Calculate start/end day within this week (0-6)
        let startDayIndex = 0;
        let endDayIndex = 6;

        if (isStart) {
          startDayIndex = getDayIndexInWeek(week, event.start);
        }
        if (isEnd) {
          endDayIndex = getDayIndexInWeek(week, event.end);
        }

        segments.push({
          event,
          weekIndex,
          week,
          startDayIndex,
          endDayIndex,
          isStart,
          isEnd,
          totalWeeks,
        });
      }
    }

    // Assign stack positions and render segments
    for (const segment of segments) {
      const {
        event,
        week,
        weekIndex,
        startDayIndex,
        endDayIndex,
        isStart,
        isEnd,
        totalWeeks,
      } = segment;
      const weekHeight = week.height;
      const weekYOffset = week.yOffset;

      const durationMs = event.end.valueOf() - event.start.valueOf();
      const h24 = 1000 * 60 * 60 * 24;
      // const allDay = durationMs % h24 === 0 && durationMs >= h24;
      const allDay = durationMs > h24;

      let yStart: number;
      let yEnd: number;

      if (showTimeScale && !allDay) {
        // Position by time for non-all-day events
        const dayStartTime = new Date(week.days[startDayIndex]!).setHours(0, 0, 0, 0);
        const dayEndTime = new Date(week.days[endDayIndex]!).setHours(23, 59, 59, 999);
        const eventStartTime = event.start.getTime();
        const eventEndTime = event.end.getTime();

        const effectiveStartTime = Math.max(eventStartTime, dayStartTime);
        const effectiveEndTime = Math.min(eventEndTime, dayEndTime);

        const effectiveStart = new Date(effectiveStartTime);
        const effectiveEnd = new Date(effectiveEndTime);

        const startMinutes = effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
        const endMinutes = effectiveEnd.getHours() * 60 + effectiveEnd.getMinutes();

        yStart = weekYOffset + (startMinutes / 1440) * weekHeight;
        yEnd = weekYOffset + (endMinutes / 1440) * weekHeight;
      } else {
        // Stack events vertically - find a row that's free across all days this segment spans
        const eventKey = `${weekIndex}-${event.id}`;
        let rowIndex = eventRowIndex.get(eventKey);

        if (rowIndex === undefined) {
          // Find the first row that's free for all days in this segment's span
          rowIndex = 0;
          while (true) {
            let rowFree = true;
            for (let d = startDayIndex; d <= endDayIndex; d++) {
              const dayKey = `${weekIndex}-${d}`;
              const occupied = dayOccupiedRows.get(dayKey);
              if (occupied?.has(rowIndex)) {
                rowFree = false;
                break;
              }
            }
            if (rowFree) break;
            rowIndex++;
          }
          eventRowIndex.set(eventKey, rowIndex);
        }

        // Mark this row as occupied for all days in this segment's span
        for (let d = startDayIndex; d <= endDayIndex; d++) {
          const dayKey = `${weekIndex}-${d}`;
          let occupied = dayOccupiedRows.get(dayKey);
          if (!occupied) {
            occupied = new Set();
            dayOccupiedRows.set(dayKey, occupied);
          }
          occupied.add(rowIndex);
        }

        const maxEventsInWeek = Math.floor((weekHeight - 4) / (MIN_EVENT_HEIGHT + 2));
        if (rowIndex >= maxEventsInWeek) continue;

        yStart = weekYOffset + 4 + rowIndex * (MIN_EVENT_HEIGHT + 2);
        yEnd = yStart + MIN_EVENT_HEIGHT;
      }

      const height = Math.max(showTimeScale ? 4 : MIN_EVENT_HEIGHT, yEnd - yStart);

      // Calculate horizontal span
      const x = startDayIndex * dayWidth;
      const spanWidth = (endDayIndex - startDayIndex + 1) * dayWidth;

      // Determine span class for visual continuity
      let spanClass = "";
      if (totalWeeks > 1) {
        if (isStart && !isEnd) spanClass = "span-start";
        else if (!isStart && isEnd) spanClass = "span-end";
        else if (!isStart && !isEnd) spanClass = "span-middle";
      }

      eventElements.push(html`
        <div
          class="event ${spanClass}"
          data-event-id="${event.id}"
          style="
            left: ${x}px;
            top: ${yStart}px;
            width: ${spanWidth - 4}px;
            height: ${height}px;
            background: ${event.color || "var(--event-default)"};
          "
          @click=${() => this.onEventClick(event)}
          @mouseenter=${this.onEventMouseEnter}
          @mouseleave=${this.onEventMouseLeave}
        >
          ${isStart ? event.title : ""}
        </div>
      `);
    }

    return html`${eventElements}`;
  }

  onEventMouseEnter = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const eventId = target.dataset.eventId;
    if (!eventId) return;

    const allSegments = this.shadowRoot?.querySelectorAll(`[data-event-id="${eventId}"]`);
    if (allSegments) {
      for (const el of allSegments) {
        el.classList.add("hovered");
      }
    }
  };

  onEventMouseLeave = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const eventId = target.dataset.eventId;
    if (!eventId) return;

    const allSegments = this.shadowRoot?.querySelectorAll(`[data-event-id="${eventId}"]`);
    if (allSegments) {
      for (const el of allSegments) {
        el.classList.remove("hovered");
      }
    }
  };

  onEventClick(event: CalendarEvent): void {
    this.dispatchEvent(
      new CustomEvent("event-click", {
        detail: event,
        bubbles: true,
      }),
    );
  }

  renderDateLabels(): ReturnType<typeof html> {
    if (!this.scrollContainer) return html``;

    const rect = {
      width: this.scrollContainer.clientWidth - LEFT_GUTTER_WIDTH,
      height: this.viewportHeight,
    };
    const dayWidth = rect.width / 7;
    const scrollTop = this.scrollTop;
    const labels: ReturnType<typeof html>[] = [];

    for (const week of this.weeks) {
      if (week.height === 0) continue;
      if (week.yOffset + week.height < scrollTop) continue;
      if (week.yOffset > scrollTop + this.viewportHeight) break;

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const day = week.days[dayIndex];
        if (!day) continue;
        const x = dayIndex * dayWidth;
        // Position at bottom right, sticky within the day cell
        const dayTop = week.yOffset - scrollTop;
        const dayBottom = dayTop + week.height;

        // Make date sticky at bottom of screen if day extends below
        const labelY = Math.min(dayBottom - 32, rect.height - 32);

        // Only show if the day cell is visible
        if (dayTop < rect.height && dayBottom > 0 && labelY > dayTop) {
          labels.push(html`
            <div
              class="date-label"
              style="left: ${x}px; top: ${labelY}px; width: ${dayWidth}px"
            >
              ${day.getDate()}
            </div>
          `);
        }
      }
    }

    return html`${labels}`;
  }

  renderSelection(): ReturnType<typeof html> {
    if (!this.selection) return html``;

    const minX = Math.min(this.selection.startX, this.selection.endX);
    const maxX = Math.max(this.selection.startX, this.selection.endX);
    const minY = Math.min(this.selection.startY, this.selection.endY);
    const maxY = Math.max(this.selection.startY, this.selection.endY);

    return html`
      <div
        class="selection"
        style="
          left: ${minX}px;
          top: ${minY}px;
          width: ${maxX - minX}px;
          height: ${maxY - minY}px;
        "
      ></div>
    `;
  }

  renderMinimap() {
    if (this.totalHeight === 0 || this.weeks.length === 0) return html``;

    // Canvas dimensions
    const width = 32;
    const height = 2000; // Adjust as needed or make dynamic

    // Calculate viewport rectangle
    const viewportRatio = this.viewportHeight / this.totalHeight;
    const viewportTop = (this.scrollTop / this.totalHeight) * height;
    const viewportHeightPx = Math.max(viewportRatio * height, 4);

    // Prepare event rectangles
    const events = this.getFilteredEvents();
    const startDateTimestamp = this.startDate.getTime();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const msPerDay = 24 * 60 * 60 * 1000;
    const msPerMinute = 60 * 1000;

    // We'll draw after the canvas is rendered
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    if (!ctx) throw new Error("Failed to get 2d context");

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw viewport rectangle
    ctx.strokeRect(1, viewportTop, width - 2, viewportHeightPx);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(2, viewportTop, width - 4, viewportHeightPx);

    // Draw event rectangles
    for (const event of events) {
      const eventStartTime = event.start.getTime();
      const eventEndTime = event.end.getTime();

      const startWeekIndex = Math.floor(
        (eventStartTime - startDateTimestamp) / msPerWeek,
      );
      const endWeekIndex = Math.floor((eventEndTime - startDateTimestamp) / msPerWeek);

      const firstWeekIndex = Math.max(0, startWeekIndex);
      const lastWeekIndex = Math.min(this.weeks.length - 1, endWeekIndex);

      for (let weekIndex = firstWeekIndex; weekIndex <= lastWeekIndex; weekIndex++) {
        const week = this.weeks[weekIndex];
        if (!week || week.height === 0) continue;

        const weekStart = week.days[0];
        const weekEnd = week.days[6];
        if (!weekStart || !weekEnd) continue;

        const weekStartTime = weekStart.getTime();
        const weekEndTime = weekEnd.getTime() + msPerDay - 1;

        const effectiveStartTime = Math.max(eventStartTime, weekStartTime);
        const effectiveEndTime = Math.min(eventEndTime, weekEndTime);

        const startMinutes = Math.floor((effectiveStartTime % msPerDay) / msPerMinute);
        const endMinutes = Math.floor((effectiveEndTime % msPerDay) / msPerMinute);

        const yStart =
          (week.yOffset / this.totalHeight) * height +
          (startMinutes / 1440) * ((week.height / this.totalHeight) * height);
        const yEnd =
          (week.yOffset / this.totalHeight) * height +
          (endMinutes / 1440) * ((week.height / this.totalHeight) * height);

        ctx.globalAlpha = 0.333;
        ctx.fillStyle = event.color || "#888";
        ctx.fillRect(2, yStart, width - 4, Math.max(yEnd - yStart, 2));
      }
    }

    canvas.onmousedown = this.onMinimapMouseDown;
    canvas.className = "minimap";

    // Render the canvas
    return canvas;
  }

  render() {
    return html`
      <div class="container">
        <div class="filter-bar">
          <input
            class="filter-input"
            type="text"
            placeholder="Filter events..."
            .value=${this.filter}
            @input=${this.onFilterInput}
          />
        </div>

        <div class="header">
          <div class="header-gutter"></div>
          <div class="weekdays">
            ${this.utils
              .getWeekdayNames()
              .map(name => html`<div class="weekday">${name}</div>`)}
          </div>
        </div>

        <div class="body">
          <div class="canvas-layer">
            <canvas></canvas>
          </div>
          <div
            class="scroll-container"
            @mousedown=${this.onCanvasMouseDown}
            @mousemove=${this.onScrollContainerMouseMove}
          >
            <div class="scroll-content" style="height: ${this.totalHeight}px;">
              <div class="events-layer">${this.renderEvents()}</div>
            </div>
            ${this.renderSelection()}
          </div>
          <div class="overlay-layer">${this.renderDateLabels()}</div>
          ${this.renderMinimap()}
        </div>
      </div>
    `;
  }
}

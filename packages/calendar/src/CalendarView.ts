import { LitElement, css, html, type PropertyValueMap } from "lit";
import { property, state } from "lit/decorators.js";
import { CalendarUtils } from "./CalendarUtils.js";

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
const MIN_EVENT_HEIGHT = 16;

export class CalendarViewElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
      --grid-color: rgba(255, 255, 255, 0.1);
      --text-color: rgba(255, 255, 255, 0.7);
      --text-muted: rgba(255, 255, 255, 0.4);
      --today-bg: rgba(255, 255, 255, 0.05);
      --selection-bg: rgba(100, 100, 255, 0.3);
      --event-default: #9b59b6;
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
      overflow-y: auto;
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
      background: rgba(0, 0, 0, 0.3);
      z-index: 10;
      cursor: pointer;
    }

    .minimap-viewport {
      position: absolute;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      pointer-events: none;
    }

    .minimap-event {
      position: absolute;
      left: 2px;
      right: 2px;
      min-height: 2px;
      border-radius: 1px;
      pointer-events: none;
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
    }

    .event:hover {
      filter: brightness(1.1);
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

  @property({ type: Array })
  events: CalendarEvent[] = [];

  @property({ type: String })
  filter = "";

  @property({ type: String })
  locale: string = navigator.language;

  /**
   * First day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
   * Defaults to locale-appropriate value.
   */
  @property({ type: Number, attribute: "week-start" })
  weekStart?: number;

  @state()
  dayHeight = 80;

  @state()
  scrollTop = 0;

  @state()
  viewportHeight = 0;

  @state()
  selection: { startX: number; startY: number; endX: number; endY: number } | null = null;

  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  scrollContainer: HTMLElement | null = null;
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
  endDate = CalendarUtils.addDays(new Date(), 365);
  utils = new CalendarUtils({ locale: this.locale, weekStart: this.weekStart });

  loadDayHeight(): number {
    try {
      const saved = localStorage.getItem("calendar-dayHeight");
      if (saved) {
        return Math.max(MIN_DAY_HEIGHT, Math.min(MAX_DAY_HEIGHT, parseFloat(saved)));
      }
    } catch (e) {
      // localStorage not available
    }
    return 80;
  }

  saveDayHeight(): void {
    try {
      localStorage.setItem("calendar-dayHeight", this.dayHeight.toString());
    } catch (e) {
      // localStorage not available
    }
  }

  saveScrollPosition(): void {
    try {
      localStorage.setItem("calendar-scrollTop", this.scrollTop.toString());
    } catch (e) {
      // localStorage not available
    }
  }

  loadScrollPosition() {
    let shouldRestoreScroll = false;
    try {
      const savedScroll = localStorage.getItem("calendar-scrollTop");
      if (savedScroll) {
        const scrollPos = parseFloat(savedScroll);
        if (this.scrollContainer) {
          this.scrollContainer.scrollTop = Math.max(0, Math.min(scrollPos, this.totalHeight - this.viewportHeight));
          shouldRestoreScroll = true;
        }
      }
    } catch (e) {
      // localStorage not available
    }

    return shouldRestoreScroll;
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
        const clampedScroll = Math.max(0, Math.min(this.preFilterScrollTop, this.totalHeight - this.viewportHeight));
        this.scrollContainer.scrollTop = clampedScroll;
        this.scrollTop = clampedScroll;
      }
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.startDate = this.utils.getStartOfWeek(CalendarUtils.addDays(new Date(), -365));
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

  protected firstUpdated(): void {
    this.canvas = this.renderRoot.querySelector("canvas");
    this.scrollContainer = this.renderRoot.querySelector(".scroll-container");
    this.ctx = this.canvas?.getContext("2d") ?? null;

    if (this.scrollContainer) {
      this.scrollContainer.addEventListener("scroll", this.onScroll);
      this.viewportHeight = this.scrollContainer.clientHeight;

      // Try to restore saved scroll position, otherwise scroll to today
      const shouldRestoreScroll = this.loadScrollPosition();

      if (!shouldRestoreScroll) {
        // Scroll to today if no saved position
        const today = new Date();
        const weekIndex = this.weeks.findIndex((w) =>
          w.days.some((d) => CalendarUtils.isSameDay(d, today))
        );
        if (weekIndex >= 0) {
          const targetWeek = this.weeks[weekIndex];
          if (targetWeek) {
            const targetScroll = targetWeek.yOffset - this.viewportHeight / 2;
            this.scrollContainer.scrollTop = Math.max(0, targetScroll);
          }
        }
      }
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this);

    this.handleResize();
    this.renderCanvas();

    // Restore zoom level from localStorage
    const savedDayHeight = this.loadDayHeight();
    if (savedDayHeight !== 80) {
      this.dayHeight = savedDayHeight;
    }
  }

  protected updated(changedProps: PropertyValueMap<this>): void {
    if (changedProps.has("locale") || changedProps.has("weekStart")) {
      this.utils = new CalendarUtils({ locale: this.locale, weekStart: this.weekStart });
      this.startDate = this.utils.getStartOfWeek(CalendarUtils.addDays(new Date(), -365));
      this.generateWeeks();
      this.renderCanvas();
    }
    if (changedProps.has("dayHeight")) {
      this.saveDayHeight();
      this.updateWeekOffsets();
      this.renderCanvas();
    }
    if (changedProps.has("filter")) {
      const previousFilter = changedProps.get("filter") as string | undefined;
      const currentFilter = this.filter;

      const wasFiltered = previousFilter && previousFilter.trim().length > 0;
      const isFiltered = currentFilter && currentFilter.trim().length > 0;

      // If filter was just cleared/reset (was filtered, now empty)
      if (wasFiltered && !isFiltered) {
        this.updateWeekOffsets();
        this.renderCanvas();
        // Restore after render completes
        requestAnimationFrame(() => {
          this.restoreFilterScrollState();
        });
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
    }
    if (changedProps.has("scrollTop")) {
      this.saveScrollPosition();
      this.renderCanvas();
    }
  }

  generateWeeks(): void {
    this.weeks = [];
    let current = new Date(this.startDate);

    while (current < this.endDate) {
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(new Date(current));
        current = CalendarUtils.addDays(current, 1);
      }

      const firstDay = days[0];
      const thursday = days[3];
      if (firstDay && thursday) {
        this.weeks.push({
          weekNumber: CalendarUtils.getWeekNumber(firstDay),
          year: thursday.getFullYear(), // Use Thursday for year
          days,
          yOffset: 0,
          height: this.dayHeight,
        });
      }
    }

    this.updateWeekOffsets();
  }

  updateWeekOffsets(): void {
    let y = 0;

    if (this.filter) {
      const filteredEvents = this.getFilteredEvents();

      // Pre-compute event date ranges once (avoiding repeated startOfDayTime/endOfDayTime calls)
      const eventRanges = filteredEvents.map((e) => ({
        start: CalendarUtils.startOfDayTime(e.start),
        end: CalendarUtils.endOfDayTime(e.end),
      }));

      for (const week of this.weeks) {
        week.yOffset = y;

        // Check if any day in this week overlaps any event range
        const weekStartTime = week.days[0]?.getTime() ?? 0;
        const weekEndTime = week.days[6]?.getTime() ?? 0;

        // Quick check: skip if week is entirely outside all event ranges
        const hasEvents = eventRanges.some(
          (range) => range.end >= weekStartTime && range.start <= weekEndTime
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
    return this.events.filter((e) => e.title.toLowerCase().includes(f));
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
      (w) =>
        w.height > 0 &&
        w.yOffset + w.height > scrollTop &&
        w.yOffset < scrollTop + height
    );

    // Draw today highlight and current time indicator
    for (const week of visibleWeeks) {
      const todayIndex = week.days.findIndex((d) => CalendarUtils.isSameDay(d, today));
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

    for (const week of visibleWeeks) {
      const y = week.yOffset - scrollTop;

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
      const labelY = Math.max(14, Math.min(weekTop + week.height / 2 + 4, weekBottom - 4));
      // Only draw if the label position is within the week's visible area and viewport and opacity is significant
      if (labelY >= Math.max(0, weekTop + 4) && labelY <= Math.min(height, weekBottom) && weekNumberOpacity > 0.1) {
        ctx.fillText(label, 30, labelY);
      }
    }

    this.requestUpdate();
  }

  onScroll = (): void => {
    if (this.scrollContainer) {
      this.scrollTop = this.scrollContainer.scrollTop;
    }
  };

  onWheel = (e: WheelEvent): void => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const isZoomKey = isMac ? e.metaKey : e.ctrlKey;

    if (!isZoomKey || !this.scrollContainer) {
      return;
    }

    e.preventDefault();

    const delta = e.deltaY * (this.dayHeight / 100);
    const newHeight = Math.max(
      MIN_DAY_HEIGHT,
      Math.min(MAX_DAY_HEIGHT, this.dayHeight - delta)
    );

    const oldHeight = this.dayHeight;
    this.dayHeight = newHeight;

    // Adjust scroll to keep zoom origin in place
    const scaleRatio = newHeight / oldHeight;

    // Calculate where the origin point is now after scaling
    const newOriginY = this.zoomOriginY * scaleRatio;

    // Adjust scroll so that point stays at the same viewport position (where drag started)
    this.scrollContainer.scrollTop = newOriginY - this.zoomViewportY;
    this.zoomOriginY = newOriginY;
  };

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
  };

  lastPointerY = 0;

  onMouseMove = (e: MouseEvent): void => {
    if (this.isDraggingMinimap) {
      this.onMinimapMouseMove(e);
      return;
    }

    if (this.isDraggingZoom && this.scrollContainer) {
      let deltaY = 0;
      if (this.lastPointerY) {
        deltaY = e.clientY - this.lastPointerY;
      }
      this.lastPointerY = e.clientY;

      const delta = deltaY * (this.dayHeight / 100);

      const newHeight = Math.max(
        MIN_DAY_HEIGHT,
        Math.min(MAX_DAY_HEIGHT, this.dayHeight - delta)
      );

      const oldHeight = this.dayHeight;
      this.dayHeight = newHeight;

      // Adjust scroll to keep zoom origin in place
      const scaleRatio = newHeight / oldHeight;

      // Calculate where the origin point is now after scaling
      const newOriginY = this.zoomOriginY * scaleRatio;

      // Adjust scroll so that point stays at the same viewport position (where drag started)
      this.scrollContainer.scrollTop = newOriginY - this.zoomViewportY;
      this.zoomOriginY = newOriginY;
    } else {
      if (this.scrollContainer) {
        // Store the Y position in content coordinates as zoom origin
        const rect = this.scrollContainer.getBoundingClientRect();
        const viewportY = e.clientY - rect.top;
        this.zoomViewportY = viewportY;
        this.zoomOriginY = viewportY + this.scrollTop;
      }
    }

    if (this.isSelecting && this.scrollContainer) {
      const rect = this.scrollContainer.getBoundingClientRect();
      this.selection = {
        startX: this.selectionStartX,
        startY: this.selectionStartY,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top + this.scrollTop,
      };
    }
  };

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
    this.scrollContainer.scrollTop = Math.max(0, Math.min(targetScroll, this.totalHeight - this.viewportHeight));
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
      (w) => w.yOffset <= minY && w.yOffset + w.height > minY
    );
    const endWeek = this.weeks.find(
      (w) => w.yOffset <= maxY && w.yOffset + w.height > maxY
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
        })
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
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
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
        const existingMonth = months.find((m) => `${m.name}-${m.year}` === key);
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

    const gridWidth = this.scrollContainer.clientWidth - LEFT_GUTTER_WIDTH;
    const dayWidth = gridWidth / 7;
    const events = this.getFilteredEvents();
    const scrollTop = this.scrollTop;
    const viewportBottom = scrollTop + this.viewportHeight;
    const showTimeScale = this.dayHeight >= 200;

    const eventElements: ReturnType<typeof html>[] = [];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Filter to visible weeks only
    const visibleWeeks = this.weeks.filter(
      (w) => w.height > 0 && w.yOffset + w.height >= scrollTop && w.yOffset <= viewportBottom
    );

    if (visibleWeeks.length === 0) return html``;

    // Compute visible date range (timestamps for fast comparison)
    const firstVisibleWeek = visibleWeeks[0]!;
    const lastVisibleWeek = visibleWeeks[visibleWeeks.length - 1]!;
    const firstVisibleDay = firstVisibleWeek.days[0]!;
    const lastVisibleDay = lastVisibleWeek.days[6]!;
    const visibleStartTime = firstVisibleDay.getTime();
    const visibleEndTime = lastVisibleDay.getTime() + 86400000 - 1; // end of last day

    // Build event index by day timestamp for O(1) lookup
    // Key: day timestamp (start of day), Value: events overlapping that day
    const eventsByDay = new Map<number, CalendarEvent[]>();

    for (const event of events) {
      const eventStartTime = event.start.getTime();
      const eventEndTime = event.end.getTime();

      // Skip events entirely outside visible range
      if (eventEndTime < visibleStartTime || eventStartTime > visibleEndTime) continue;

      // Compute the day range this event spans (clamped to visible range)
      const startDay = new Date(Math.max(eventStartTime, visibleStartTime));
      startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(Math.min(eventEndTime, visibleEndTime));
      endDay.setHours(0, 0, 0, 0);

      // Index event for each day it spans
      const currentDay = new Date(startDay);
      while (currentDay <= endDay) {
        const dayKey = currentDay.getTime();
        let dayEvents = eventsByDay.get(dayKey);
        if (!dayEvents) {
          dayEvents = [];
          eventsByDay.set(dayKey, dayEvents);
        }
        dayEvents.push(event);
        currentDay.setDate(currentDay.getDate() + 1);
      }
    }

    // Collect month boundaries from visible weeks only
    const monthBoundaries: { monthKey: string; monthName: string; year: number; yOffset: number }[] = [];
    const seenMonths = new Set<string>();

    for (const week of visibleWeeks) {
      const firstDay = week.days[0];
      if (!firstDay) continue;

      const monthIndex = firstDay.getMonth();
      const year = firstDay.getFullYear();
      const monthKey = `${monthIndex}-${year}`;

      if (firstDay.getDate() <= 7 && !seenMonths.has(monthKey)) {
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

    // Track event count per day for stacking when zoomed out
    const dayEventCount = new Map<string, number>();
    const dayTotalCount = new Map<string, number>();

    // Render events by iterating visible weeks and looking up indexed events
    for (const week of visibleWeeks) {
      const weekHeight = week.height;
      const weekYOffset = week.yOffset;
      const maxEventsInDay = Math.floor(weekHeight / (MIN_EVENT_HEIGHT + 8));

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const day = week.days[dayIndex];
        if (!day) continue;

        // Get cached day boundaries
        const dayStartTime = new Date(day).setHours(0, 0, 0, 0);
        const dayEvents = eventsByDay.get(dayStartTime);
        if (!dayEvents || dayEvents.length === 0) continue;

        const dayKey = `${week.weekNumber}-${dayIndex}`;
        const x = dayIndex * dayWidth;

        // Set total count for overflow detection
        dayTotalCount.set(dayKey, dayEvents.length);

        for (const event of dayEvents) {
          let yStart: number;
          let yEnd: number;

          if (showTimeScale) {
            // Position by time - use timestamps for comparison
            const eventStartTime = event.start.getTime();
            const eventEndTime = event.end.getTime();
            const dayEndTime = dayStartTime + 86400000 - 1;

            const effectiveStartTime = Math.max(eventStartTime, dayStartTime);
            const effectiveEndTime = Math.min(eventEndTime, dayEndTime);

            const effectiveStart = new Date(effectiveStartTime);
            const effectiveEnd = new Date(effectiveEndTime);

            const startMinutes = effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
            const endMinutes = effectiveEnd.getHours() * 60 + effectiveEnd.getMinutes();

            yStart = weekYOffset + (startMinutes / 1440) * weekHeight;
            yEnd = weekYOffset + (endMinutes / 1440) * weekHeight;
          } else {
            // Stack events vertically within the day cell
            const stackIndex = dayEventCount.get(dayKey) || 0;

            if (stackIndex >= maxEventsInDay) continue;

            dayEventCount.set(dayKey, stackIndex + 1);

            yStart = weekYOffset + 28 + stackIndex * (MIN_EVENT_HEIGHT + 2);
            yEnd = yStart + MIN_EVENT_HEIGHT;
          }

          const height = Math.max(showTimeScale ? 4 : MIN_EVENT_HEIGHT, yEnd - yStart);

          const durationMs = event.end.valueOf() - event.start.valueOf();
          const h24 = 1000 * 60 * 60 * 24;
          const allDay = durationMs % h24 === 0 && durationMs >= h24;

          eventElements.push(html`
            <div
              class="event"
              style="
                left: ${x + 2}px;
                top: ${yStart}px;
                width: ${dayWidth - (allDay ? 0 : 15)}px;
                height: ${height}px;
                background: ${event.color || "var(--event-default)"};
                border-radius: ${allDay ? 0 : 12};
              "
              @click=${() => this.onEventClick(event)}
            >
              ${event.title}
            </div>
          `);
        }
      }
    }

    return html`${eventElements}`;
  }

  onEventClick(event: CalendarEvent): void {
    this.dispatchEvent(
      new CustomEvent("event-click", {
        detail: event,
        bubbles: true,
      })
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

  renderMinimap(): ReturnType<typeof html> {
    if (this.totalHeight === 0 || this.weeks.length === 0) return html``;

    const events = this.getFilteredEvents();
    const viewportRatio = this.viewportHeight / this.totalHeight;
    const viewportTop = (this.scrollTop / this.totalHeight) * 100;
    const viewportHeight = Math.max(viewportRatio * 100, 2);

    const eventMarkers: ReturnType<typeof html>[] = [];
    const startDateTimestamp = this.startDate.getTime();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const msPerDay = 24 * 60 * 60 * 1000;
    const msPerMinute = 60 * 1000;

    for (const event of events) {
      const eventStartTime = event.start.getTime();
      const eventEndTime = event.end.getTime();

      // Calculate week indices directly from dates - O(1) instead of O(weeks × days)
      const startWeekIndex = Math.floor((eventStartTime - startDateTimestamp) / msPerWeek);
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

        // Compute minutes from midnight using timestamp math (no Date object creation)
        const startMinutes = Math.floor((effectiveStartTime % msPerDay) / msPerMinute);
        const endMinutes = Math.floor((effectiveEndTime % msPerDay) / msPerMinute);

        const yStart = week.yOffset + (startMinutes / 1440) * week.height;
        const yEnd = week.yOffset + (endMinutes / 1440) * week.height;

        const topPercent = (yStart / this.totalHeight) * 100;
        const heightPercent = Math.max(((yEnd - yStart) / this.totalHeight) * 100, 0.3);

        eventMarkers.push(html`
          <div
            class="minimap-event"
            style="
              top: ${topPercent}%;
              height: ${heightPercent}%;
              background: ${event.color || "var(--event-default)"};
            "
          ></div>
        `);
      }
    }

    return html`
      <div class="minimap" @mousedown=${this.onMinimapMouseDown}>
        <div
          class="minimap-viewport"
          style="top: ${viewportTop}%; height: ${viewportHeight}%;"
        ></div>
        ${eventMarkers}
      </div>
    `;
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
            ${this.utils.getWeekdayNames().map((name) => html`<div class="weekday">${name}</div>`)}
          </div>
        </div>

        <div class="body">
          <div class="canvas-layer">
            <canvas></canvas>
          </div>
          <div class="scroll-container" @mousedown=${this.onCanvasMouseDown} @mousemove=${this.onScrollContainerMouseMove}>
            <div class="scroll-content" style="height: ${this.totalHeight}px;">
              <div class="events-layer">
                ${this.renderEvents()}
              </div>
            </div>
            ${this.renderSelection()}
          </div>
          <div class="overlay-layer">
            ${this.renderDateLabels()}
          </div>
          ${this.renderMinimap()}
        </div>
      </div>
    `;
  }


}

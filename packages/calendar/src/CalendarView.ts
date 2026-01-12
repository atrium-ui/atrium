import { LitElement, css, html, type PropertyValueMap } from "lit";
import { property, state } from "lit/decorators.js";

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
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MIN_DAY_HEIGHT = 30;
const MAX_DAY_HEIGHT = 1440; // 1px per minute
const LEFT_GUTTER_WIDTH = 60;
const MIN_EVENT_HEIGHT = 16;

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

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
      transition: opacity 0.3s ease;
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
      border-left: 3px solid rgba(0, 0, 0, 0.3);
    }

    .event:hover {
      filter: brightness(1.1);
    }

    .month-label {
      position: sticky;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.8);
      padding: 4px 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color);
      z-index: 5;
      pointer-events: none;
    }

    .selection {
      position: absolute;
      background: var(--selection-bg);
      border: 1px solid rgba(100, 100, 255, 0.5);
      border-radius: 2px;
      pointer-events: none;
    }



    .date-label {
      position: absolute;
      font-size: 11px;
      color: var(--text-muted);
      padding: 2px 4px;
    }
  `;

  @property({ type: Array })
  events: CalendarEvent[] = [];

  @property({ type: String })
  filter = "";

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

  // Generate weeks for a year range centered on current date
  startDate = getStartOfWeek(addDays(new Date(), -365));
  endDate = addDays(new Date(), 365);

  connectedCallback(): void {
    super.connectedCallback();
    this.generateWeeks();
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    this.resizeObserver?.disconnect();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  protected firstUpdated(): void {
    this.canvas = this.renderRoot.querySelector("canvas");
    this.scrollContainer = this.renderRoot.querySelector(".scroll-container");
    this.ctx = this.canvas?.getContext("2d") ?? null;

    if (this.scrollContainer) {
      this.scrollContainer.addEventListener("scroll", this.onScroll);
      this.viewportHeight = this.scrollContainer.clientHeight;

      // Scroll to today
      const today = new Date();
      const weekIndex = this.weeks.findIndex((w) =>
        w.days.some((d) => isSameDay(d, today))
      );
      if (weekIndex >= 0) {
        const targetWeek = this.weeks[weekIndex];
        if (targetWeek) {
          const targetScroll = targetWeek.yOffset - this.viewportHeight / 2;
          this.scrollContainer.scrollTop = Math.max(0, targetScroll);
        }
      }
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this);

    this.handleResize();
    this.scheduleRender();
  }

  protected updated(changedProps: PropertyValueMap<this>): void {
    if (changedProps.has("dayHeight") || changedProps.has("filter")) {
      this.updateWeekOffsets();
      this.scheduleRender();
    }
    if (changedProps.has("scrollTop")) {
      this.scheduleRender();
    }
  }

  generateWeeks(): void {
    this.weeks = [];
    let current = new Date(this.startDate);

    while (current < this.endDate) {
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(new Date(current));
        current = addDays(current, 1);
      }

      const firstDay = days[0];
      const thursday = days[3];
      if (firstDay && thursday) {
        this.weeks.push({
          weekNumber: getWeekNumber(firstDay),
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
    const filteredEvents = this.getFilteredEvents();

    for (const week of this.weeks) {
      week.yOffset = y;

      if (this.filter) {
        // In filtered mode, collapse empty weeks
        const hasEvents = week.days.some((day) =>
          filteredEvents.some(
            (e) => day >= this.startOfDay(e.start) && day <= this.endOfDay(e.end)
          )
        );
        week.height = hasEvents ? this.dayHeight : 0;
      } else {
        week.height = this.dayHeight;
      }

      y += week.height;
    }

    this.totalHeight = y;
  }

  startOfDay(date: Date | undefined): Date {
    if (!date) return new Date(0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  endOfDay(date: Date | undefined): Date {
    if (!date) return new Date(0);
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
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

    this.scheduleRender();
  }

  scheduleRender(): void {
    if (this.animationFrame) return;
    this.animationFrame = requestAnimationFrame(() => {
      this.animationFrame = null;
      this.renderCanvas();
    });
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
    const showTimeScale = this.dayHeight >= 200;

    // Find visible weeks
    const visibleWeeks = this.weeks.filter(
      (w) =>
        w.height > 0 &&
        w.yOffset + w.height > scrollTop &&
        w.yOffset < scrollTop + height
    );

    // Draw today highlight
    for (const week of visibleWeeks) {
      const todayIndex = week.days.findIndex((d) => isSameDay(d, today));
      if (todayIndex >= 0) {
        const x = LEFT_GUTTER_WIDTH + todayIndex * dayWidth;
        const y = week.yOffset - scrollTop;
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.fillRect(x, y, dayWidth, week.height);
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
    ctx.font = "11px system-ui, sans-serif";

    for (const week of visibleWeeks) {
      const y = week.yOffset - scrollTop;

      // Week separator line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Left gutter: week number or time scale
      if (showTimeScale) {
        // Draw hourly lines and labels
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";

        // Calculate opacity for hour labels based on zoom level
        // Fade in as we zoom in from 200px to 400px
        const hourLabelOpacity = Math.max(0, Math.min(1, (this.dayHeight - 200) / 200));
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
              ctx.fillText(label, 8, hourY + 12);
            }
          }
        }
      } else {
        // Draw week number - sticky within visible portion of week
        // Fade out week numbers as we zoom in from 150px to 200px
        const weekNumberOpacity = Math.max(0, Math.min(1, 1 - (this.dayHeight - 150) / 50));
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * weekNumberOpacity})`;
        const label = `W${week.weekNumber}`;
        const weekTop = y;
        const weekBottom = y + week.height;
        // Clamp label to be visible: at least 14px from top of viewport,
        // but within the week's bounds
        const labelY = Math.max(14, Math.min(weekTop + week.height / 2 + 4, weekBottom - 4));
        // Only draw if the label position is within the week's visible area and viewport and opacity is significant
        if (labelY >= Math.max(0, weekTop + 4) && labelY <= Math.min(height, weekBottom) && weekNumberOpacity > 0.1) {
          ctx.fillText(label, 8, labelY);
        }
      }
    }

    // Left gutter separator
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.moveTo(LEFT_GUTTER_WIDTH, 0);
    ctx.lineTo(LEFT_GUTTER_WIDTH, height);
    ctx.stroke();

    this.requestUpdate();
  }

  onScroll = (): void => {
    if (this.scrollContainer) {
      this.scrollTop = this.scrollContainer.scrollTop;
    }
  };

  onZoomHandleMouseDown = (e: MouseEvent): void => {
    if (!this.scrollContainer) return;
    e.preventDefault();
    this.isDraggingZoom = true;
    this.zoomDragStartY = e.clientY;
    this.zoomDragStartHeight = this.dayHeight;

    // Store the Y position in content coordinates as zoom origin
    const rect = this.scrollContainer.getBoundingClientRect();
    this.zoomViewportY = e.clientY - rect.top;
    this.zoomOriginY = this.scrollTop + this.zoomViewportY;
  };

  onMouseMove = (e: MouseEvent): void => {
    if (this.isDraggingMinimap) {
      this.onMinimapMouseMove(e);
      return;
    }
    if (this.isDraggingZoom && this.scrollContainer) {
      const delta = e.clientY - this.zoomDragStartY;
      const scale = 1 + delta / 200;
      const newHeight = Math.max(
        MIN_DAY_HEIGHT,
        Math.min(MAX_DAY_HEIGHT, this.zoomDragStartHeight * scale)
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
    } else if (this.isSelecting && this.scrollContainer) {
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

    // Check if clicking on zoom handle area (left gutter)
    if (x < LEFT_GUTTER_WIDTH) {
      this.onZoomHandleMouseDown(e);
      return;
    }

    // Start selection
    e.preventDefault();
    this.isSelecting = true;
    this.selectionStartX = x;
    this.selectionStartY = e.clientY - rect.top + this.scrollTop;
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

    // Track event count per day for stacking when zoomed out
    const dayEventCount = new Map<string, number>();
    // Track total events per day for overflow detection
    const dayTotalCount = new Map<string, number>();

    for (const event of events) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Find all days this event spans
      for (const week of this.weeks) {
        if (week.height === 0) continue;
        // Skip weeks not in viewport
        if (week.yOffset + week.height < scrollTop) continue;
        if (week.yOffset > viewportBottom) continue;

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const day = week.days[dayIndex];
          if (!day) continue;
          const dayStart = this.startOfDay(day);
          const dayEnd = this.endOfDay(day);

          // Check if event overlaps this day
          if (eventStart <= dayEnd && eventEnd >= dayStart) {
            const dayKey = `${week.weekNumber}-${dayIndex}`;
            const totalCount = (dayTotalCount.get(dayKey) || 0) + 1;
            dayTotalCount.set(dayKey, totalCount);

            const x = dayIndex * dayWidth;
            let yStart: number;
            let yEnd: number;

            if (showTimeScale) {
              // Position by time
              const effectiveStart = eventStart < dayStart ? dayStart : eventStart;
              const effectiveEnd = eventEnd > dayEnd ? dayEnd : eventEnd;

              const startMinutes =
                effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
              const endMinutes =
                effectiveEnd.getHours() * 60 + effectiveEnd.getMinutes();

              // Use absolute positions (scroll container handles offset)
              yStart = week.yOffset + (startMinutes / 1440) * week.height;
              yEnd = week.yOffset + (endMinutes / 1440) * week.height;
            } else {
              // Stack events vertically within the day cell
              const stackIndex = dayEventCount.get(dayKey) || 0;

              // Check if adding this event would exceed the day's capacity
              const maxEventsInDay = Math.floor(week.height / (MIN_EVENT_HEIGHT + 2));
              if (stackIndex >= maxEventsInDay) {
                continue;
              }

              dayEventCount.set(dayKey, stackIndex + 1);

              yStart = week.yOffset + 2 + stackIndex * (MIN_EVENT_HEIGHT + 2);
              yEnd = yStart + MIN_EVENT_HEIGHT;
            }

            const height = Math.max(MIN_EVENT_HEIGHT, yEnd - yStart);

            eventElements.push(html`
              <div
                class="event"
                style="
                  left: ${x + 2}px;
                  top: ${yStart}px;
                  width: ${dayWidth - 4}px;
                  height: ${height}px;
                  background: ${event.color || "var(--event-default)"};
                "
                @click=${() => this.onEventClick(event)}
              >
                ${event.title}
              </div>
            `);
          }
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
        const labelY = Math.min(dayBottom - 20, rect.height - 20);

        // Only show if the day cell is visible
        if (dayTop < rect.height && dayBottom > 0 && labelY > dayTop) {
          labels.push(html`
            <div
              class="date-label"
              style="left: ${x + dayWidth - 28}px; top: ${labelY}px;"
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
    const minY = Math.min(this.selection.startY, this.selection.endY) - this.scrollTop;
    const maxY = Math.max(this.selection.startY, this.selection.endY) - this.scrollTop;

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
    if (this.totalHeight === 0) return html``;

    const events = this.getFilteredEvents();
    const viewportRatio = this.viewportHeight / this.totalHeight;
    const viewportTop = (this.scrollTop / this.totalHeight) * 100;
    const viewportHeight = Math.max(viewportRatio * 100, 2);

    const eventMarkers: ReturnType<typeof html>[] = [];

    for (const event of events) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Find the weeks this event spans
      for (const week of this.weeks) {
        if (week.height === 0) continue;

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const day = week.days[dayIndex];
          if (!day) continue;
          const dayStart = this.startOfDay(day);
          const dayEnd = this.endOfDay(day);

          if (eventStart <= dayEnd && eventEnd >= dayStart) {
            const effectiveStart = eventStart < dayStart ? dayStart : eventStart;
            const effectiveEnd = eventEnd > dayEnd ? dayEnd : eventEnd;

            const startMinutes = effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
            const endMinutes = effectiveEnd.getHours() * 60 + effectiveEnd.getMinutes();

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
    const visibleMonths = this.getVisibleMonths();
    const firstMonth = visibleMonths[0];

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
          <div class="header-gutter">
            ${firstMonth ? html`<span class="month-label">${firstMonth.name}</span>` : ""}
          </div>
          <div class="weekdays">
            ${WEEKDAY_NAMES.map((name) => {
              // Crossfade weekday names: fade out when zooming in (dayHeight >= 150)
              const showTimeScale = this.dayHeight >= 200;
              const fadeThreshold = 150;
              let opacity = 1;
              if (this.dayHeight >= fadeThreshold && this.dayHeight < 200) {
                // Fade out as we zoom in from 150 to 200
                opacity = 1 - (this.dayHeight - fadeThreshold) / (200 - fadeThreshold);
              } else if (this.dayHeight >= 200) {
                opacity = 0;
              }
              return html`<div class="weekday" style="opacity: ${opacity};">${name}</div>`;
            })}
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

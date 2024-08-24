const styles = `
  :host {
		--split-bar-color: rgba(255, 255, 255, 0.3);
		--split-bar-color-hover: rgba(255, 255, 255, 0.2);
		--layout-grid-gap: 3px;

		position: relative;
		overflow: hidden;
		display: grid;
		grid-gap: var(--layout-grid-gap);
    width: 100%;
    height: 100%;
	}

	.split-bar {
		--size: 0;
		--x: 0;
		--y: 0;

		z-index: 100000;
		position: fixed;
		left: calc(var(--x, 0) * 1px);
		top: calc(var(--y, 0) * 1px);
		background: var(--split-bar-color-hover);
	}
	.split-bar[active] {
		background: var(--split-bar-color);
	}
	.split-bar.vertical {
		height: 100%;
		width: calc(var(--size) * 1px);
		transform: translate(-50%, 0);
	}
	.split-bar.horizontal {
		width: 100%;
		height: calc(var(--size) * 1px);
		transform: translate(0, -50%);
	}
	.split-bar::after {
		content: "";
		z-index: 10000;
		position: absolute;
		top: 0;
		left: 0;
	}
	.split-bar.vertical::after {
		width: 200px;
		height: 100%;
		transform: translate(-50%, 0);
		cursor: col-resize;
	}
	.split-bar.horizontal::after {
		height: 200px;
		width: 100%;
		transform: translate(0, -50%);
		cursor: row-resize;
	}
`;

export class Panel extends HTMLElement {
  template() {
    return "<slot></slot>";
  }

  styles() {
    return styles;
  }

  get childElements() {
    return [...this.children].filter((ele) => ele instanceof Panel);
  }

  get shadowSlot() {
    for (const child of this.shadowRoot?.children || []) {
      if (child instanceof HTMLSlotElement) return child;
    }
    return null;
  }

  columns: number[] = [];
  rows: number[] = [];

  resizableRow = false;
  resizableColumn = true;
  removeOnEmtpy = false;
  boundsInvalid = true;

  chacnelDragOver = () => {
    this.removeAttribute("drag-over");
  };

  slotChangeCallback() {
    requestAnimationFrame(() => {
      if (this.removeOnEmtpy && this.children.length === 0) {
        this.parentNode?.removeChild(this);
      }
    });

    this.layoutUpdate();
    this.onLayoutChange();
  }

  constructor() {
    super();

    this.addEventListener("dragend", this.chacnelDragOver);
    this.addEventListener("dragcancel", this.chacnelDragOver);
    this.addEventListener("dragleave", this.chacnelDragOver);
    this.addEventListener("drop", this.chacnelDragOver);

    // ignore components on drag over
    this.addEventListener("dragstart", (e) => {
      if (e.dataTransfer?.getData("tab")) {
        this.setAttribute("drag-over", "");
      }
    });
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    if (!this.shadowRoot) {
      throw new Error("Failed to attach shadow root");
    }

    this.shadowRoot.innerHTML = this.template();
    const style = document.createElement("style");
    style.innerHTML = this.styles();
    this.shadowRoot.appendChild(style);

    if (this.shadowSlot) {
      this.shadowSlot.onslotchange = (e) => this.slotChangeCallback();
    }

    this.slotChangeCallback();

    window.addEventListener("resize", () => {
      this.boundsInvalid = true;
    });

    this.resizable();
  }

  resizable() {
    const splitBar = document.createElement("div");
    splitBar.className = "split-bar";

    const borderSizeVar = getComputedStyle(this).getPropertyValue("--layout-grid-gap");
    const borderSize = Number.parseInt(borderSizeVar);

    let pointerDownEvent: PointerEvent | null = null;
    let resizeAvailable = [0, 0];

    const pointerMoveHandler = (e, index) => {
      // check if bounds needs update
      if (this.boundsInvalid) {
        this.updateBounds();
      }

      const children = this.childElements;

      // return here if target is the last child
      if (children.length - 1 <= index) {
        return;
      }

      const column = children[index];
      const columnBounds = column.boundingBox;

      const borderX =
        columnBounds.left +
        this.width * (this.columns[index] / children.length) +
        borderSize / 2;
      const borderY =
        columnBounds.top +
        this.height * (this.rows[index] / children.length) +
        borderSize / 2;

      const minElementFraction = 0.05;

      const mouse = [e.x, e.y];

      const mouseDelta = [e.movementX, e.movementY];

      const delta = [
        this.columns[index] + mouseDelta[0] / this.width > minElementFraction &&
        this.columns[index + 1] - mouseDelta[0] / this.width > minElementFraction
          ? mouseDelta[0]
          : 0,

        this.rows[index] + mouseDelta[1] / this.height > minElementFraction &&
        this.rows[index + 1] - mouseDelta[1] / this.height > minElementFraction
          ? mouseDelta[1]
          : 0,
      ];

      const resizable = [
        this.resizableColumn &&
          mouse[0] > borderX - borderSize &&
          mouse[0] < borderX + borderSize &&
          mouse[1] < borderY &&
          mouse[1] > columnBounds.top,

        this.resizableRow &&
          mouse[1] > borderY - borderSize &&
          mouse[1] < borderY + borderSize &&
          mouse[0] < borderX &&
          mouse[0] > columnBounds.left,
      ];

      const resizeX = resizable[0] || resizeAvailable[0];
      const resizeY = resizable[1] || resizeAvailable[1];

      if (pointerDownEvent) {
        if (resizeX) {
          this.onResize([delta[0], 0], index);
        }
        if (resizeY) {
          this.onResize([0, delta[1]], index);
        }
      }

      // update splitbar

      if (resizeX || (resizeY && !splitBar.parentNode)) {
        this.shadowRoot.appendChild(splitBar);
      }

      if (splitBar.parentNode) {
        if (!pointerDownEvent && !resizeX && !resizeY) {
          splitBar.remove();
        }

        if (pointerDownEvent) {
          splitBar.setAttribute("active", "");
        } else {
          splitBar.removeAttribute("active");
        }

        if (resizeX) {
          splitBar.className = "split-bar vertical";
          splitBar.style.setProperty("--size", borderSize);
          splitBar.style.setProperty(
            "--x",
            pointerDownEvent ? borderX + delta[0] : borderX,
          );
          splitBar.style.setProperty("--y", column.boundingBox.top);
          splitBar.style.height = `${column.height}px`;
        }

        if (resizeY) {
          splitBar.className = "split-bar horizontal";
          splitBar.style.setProperty("--size", borderSize);
          splitBar.style.setProperty(
            "--y",
            pointerDownEvent ? borderY + delta[1] : borderY,
          );
          splitBar.style.setProperty("--x", column.boundingBox.left);
          splitBar.style.width = `${column.width}px`;
        }
      }

      // set resize state
      if (!pointerDownEvent) {
        resizeAvailable = resizable;
      }

      return resizeAvailable[0] || resizeAvailable[1];
    };

    const cancelPointerHandler = (e) => {
      if (pointerDownEvent) {
        this.onLayoutChange();
      }

      pointerDownEvent = null;
      splitBar.removeAttribute("active");
    };

    const pointerDownHandler = (e) => {
      if (resizeAvailable[0] || resizeAvailable[1]) {
        pointerDownEvent = e;
        splitBar.setAttribute("active", "");
      }
    };

    let activeChild: number | null = null;

    this.addEventListener("pointerdown", pointerDownHandler);

    window.addEventListener("pointermove", (e) => {
      if (resizeAvailable[0] || resizeAvailable[1]) {
        pointerMoveHandler(e, activeChild);
        e.preventDefault();
      } else {
        for (let c = 0; c < this.childElements.length; c++) {
          if (pointerMoveHandler(e, c)) {
            e.preventDefault();
            activeChild = c;
            return;
          }
        }
      }
    });
    window.addEventListener("pointerup", cancelPointerHandler);
    window.addEventListener("pointercancel", cancelPointerHandler);

    if (this.boundsInvalid) {
      this.updateBounds();
    }
  }

  onLayoutChange() {
    window.dispatchEvent(new Event("resize"));
  }

  width = 0;
  height = 0;
  boundingBox?: DOMRect;

  updateBounds() {
    this.width = this.clientWidth;
    this.height = this.clientHeight;
    this.boundingBox = this.getBoundingClientRect();

    for (const child of this.childElements) {
      child.width = child.clientWidth;
      child.height = child.clientHeight;
      child.boundingBox = child.getBoundingClientRect();
    }

    this.layoutUpdate();

    this.boundsInvalid = false;
  }

  onResize(delta, childIndex) {
    const children = this.childElements;
    const availableWidth = this.width;
    const availableHeight = this.height;

    if (delta[0]) {
      const frac = (delta[0] / availableWidth) * children.length;

      this.columns[childIndex] = (this.columns[childIndex] || 1) + frac;
      this.columns[childIndex + 1] = (this.columns[childIndex + 1] || 1) - frac;
    }

    if (delta[1]) {
      const frac = (delta[1] / availableHeight) * children.length;

      this.rows[childIndex] = (this.rows[childIndex] || 1) + frac;
      this.rows[childIndex + 1] = (this.rows[childIndex + 1] || 1) - frac;
    }

    this.setLayoutTempalte(this.columns, this.rows);
  }

  layoutUpdate() {
    const children = this.childElements;

    this.columns = [];
    this.rows = [];

    if (children.length === 1) {
      this.columns = [1];
      this.rows = [1];
    } else {
      for (let i = 0; i < children.length; i++) {
        this.columns[i] = (children[i].width / this.width) * children.length;
        this.rows[i] = (children[i].height / this.height) * children.length;
      }
    }

    this.setLayoutTempalte(this.columns, this.rows);
  }

  setLayoutTempalte(columnTemplate = [1, 1], rowTemplate = [1, 1]) {
    if (this.resizableColumn) {
      this.style.gridTemplateColumns = columnTemplate
        .map((n) => `${n.toFixed(4)}fr`)
        .join(" ");
      this.style.gridTemplateRows = "1fr";
    }
    if (this.resizableRow) {
      this.style.gridTemplateColumns = "1fr";
      this.style.gridTemplateRows = rowTemplate.map((n) => `${n.toFixed(4)}fr`).join(" ");
    }

    window.dispatchEvent(new Event("layout"));
  }
}

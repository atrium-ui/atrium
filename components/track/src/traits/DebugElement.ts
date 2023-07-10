export default class DebugElement extends HTMLElement {
  props: Array<string | number | number[] | (number | string)[]> = [];
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D | null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });

    if (this.shadowRoot && !this.canvas) {
      const ele = document.createElement("canvas");

      this.canvas = ele;
      this.context = this.canvas.getContext("2d");
      this.shadowRoot.appendChild(ele);
    }

    this.render();
  }

  plot(propIndex: number, title: string, n: number) {
    let arr = this.props[propIndex];
    if (!Array.isArray(arr)) {
      arr = this.props[propIndex] = [];
    }
    arr.push(n);

    if (arr.length > this.canvas.width - 10) {
      arr.shift();
    }

    arr[0] = title;
  }

  add(item: number | number[] | string) {
    return this.props.push(item);
  }

  set(index: number, value) {
    this.props[index] = value;
  }

  fontSize = 12;

  lineHeight(row: number) {
    return this.fontSize + this.fontSize * row * 1.2;
  }

  width = 100;

  drawGraph(
    ctx: CanvasRenderingContext2D,
    title: string | number,
    row: number,
    arr: number[],
    color = "red"
  ) {
    const params = title.toString().split(";");

    color = params[1] || color;

    ctx.fillStyle = "white";

    const maxValue = Math.max(Math.max(...arr), 1);

    ctx.save();

    ctx.translate(0, this.lineHeight(row));

    const height = this.lineHeight(2);

    function scaleToCanvas(x) {
      const h = height - 20;
      return h - (x / maxValue) * h;
    }

    const leftPad = 4.5;

    // draw graph
    ctx.beginPath();
    ctx.strokeStyle = color;

    ctx.globalAlpha = 0.1;
    ctx.fillRect(leftPad, 0, this.canvas.width - 10, height - 20);
    ctx.globalAlpha = 1;

    for (let index = 0; index < arr.length; index++) {
      const x = index;
      const y = scaleToCanvas(arr[index]);
      if (index === 0) {
        ctx.moveTo(x + leftPad, y);
      }
      ctx.lineTo(x + leftPad, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "white";

    ctx.restore();

    ctx.textAlign = "left";

    const y = this.lineHeight(row);
    let x = leftPad;

    if (params[0]) {
      ctx.fillText(params[0] + ":", x, y + height);
      x += params[0].length * 7 + 2;
    }

    ctx.fillText((arr[arr.length - 1] || "").toString(), x, y + height);
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    this.canvas.height =
      this.lineHeight(
        this.props.reduce((prev: number, next) => {
          if (Array.isArray(next)) {
            return prev + 3;
          }
          return prev + 1;
        }, 0) as number
      ) + 4;

    if (!this.context) return;
    const ctx = this.context;
    const canvas = ctx.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let line = 0;

    for (let i = 0; i < this.props.length; i++) {
      switch (typeof this.props[i]) {
        case "object": {
          const item = this.props[i];
          if (Array.isArray(item)) {
            this.drawGraph(ctx, item[0] || "", line, item.slice(1) as number[]);
          }
          line += 3;
          break;
        }
        default:
          this.drawRow(ctx, line, this.props[i]);
      }
      line++;
    }
  }

  drawRow(ctx, row, value) {
    ctx.fillStyle = "white";
    ctx.font = "300 " + this.fontSize + "px sans-serif";
    if (value) ctx.fillText(value, 5, this.lineHeight(row));
  }
}

customElements.define("debug-hud", DebugElement);

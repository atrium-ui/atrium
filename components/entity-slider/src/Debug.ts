let accumulator = 0;

export default class Graph extends Element {
  set enabled(b) {
    this._enabled = b;

    if (b === true) {
      this.show();
    } else {
      this.hide();
    }
  }

  get enabled() {
    return this._enabled;
  }

  constructor() {
    super();

    this.updaterate = 16;
    this.scale = 1.5;
    this.opacity = 0.6;

    this.history = [];
  }

  connectedCallback() {
    const ele = document.createElement("canvas");
    this.appendChild(ele);

    this.canvas = ele;
    this.context = ele.getContext("2d");
    this.width = this.context.canvas.width;

    Preferences.onchange = (cahnge) => {
      if (cahnge.developer) {
        this.enabled = true;
      } else {
        this.enabled = false;
      }
    };

    this.enabled = Preferences.get("developer");
  }

  update(game, ms) {
    if (!this.enabled) return;

    accumulator += ms;
    if (accumulator > this.updaterate) {
      this.pushState(game.FPS);
      accumulator = 0;
    }
  }

  pushState(state) {
    this.history.push(Math.floor(state * 10) / 10);
    if (this.history.length > this.width / this.scale) {
      this.history.shift();
    }
  }

  hide() {
    this.style.display = "none";
  }

  show() {
    this.style.display = "block";
    this.render();
  }

  render() {
    const ctx = this.context;
    const canvas = ctx.canvas;

    const arr = this.history;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.globalAlpha = this.opacity;

    this.drawGrpah(ctx, arr, "red");

    if (this.enabled) {
      requestAnimationFrame(this.render.bind(this));
    }
  }

  drawGrpah(ctx, arr, color = "white") {
    const canvas = ctx.canvas;
    const maxValue = Math.max(...arr);

    ctx.save();

    ctx.translate(0, 10);

    const height = canvas.height - 30;

    function scaleToCanvas(x) {
      return height - (x / maxValue) * height;
    }

    // draw graph
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(24.5, 0);

    for (let index = 0; index < arr.length; index++) {
      const x = index * this.scale;
      const y = scaleToCanvas(arr[index]);
      ctx.lineTo(x + 24.5, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "white";

    // draw sepearators
    ctx.beginPath();
    ctx.moveTo(24.5, 0);
    ctx.lineTo(24.5, height - 0.5);
    ctx.lineTo(this.width, height - 0.5);
    ctx.stroke();

    // draw numbers
    ctx.textAlign = "right";

    for (let i = 0; i < maxValue; i += 20) {
      const y = scaleToCanvas(i);
      ctx.fillText(i, 18, y);
    }

    ctx.restore();

    // draw details

    ctx.textAlign = "left";

    if (arr.length > 1) {
      const sum = arr.reduce((a, b) => a + b);
      const avg = (sum / arr.length).toFixed(1);
      ctx.fillText("avg: " + avg, 24.5, height + 24);
    }

    ctx.fillText("cur: " + arr[arr.length - 1], 24.5 + 60, height + 24);
  }
}

customElements.define("hud-graph", Graph);

import { Element } from "../Panels";
import Preferences from "../../../../engine/Misc/Preferences";

export default class Dev extends Element {
  set enabled(b) {
    this._enabled = b;

    if (b === true) {
      this.show();
    } else {
      this.hide();
    }
  }

  get enabled() {
    return this._enabled;
  }

  constructor() {
    super();
    this.props = {};
  }

  connectedCallback() {
    const ele = document.createElement("canvas");
    ele.height = 160;

    this.appendChild(ele);

    this.canvas = ele;
    this.context = this.canvas.getContext("2d");

    Preferences.onchange = (cahnge) => {
      if (cahnge.developer) {
        this.enabled = true;
      } else {
        this.enabled = false;
      }
    };

    this.enabled = Preferences.get("developer");
  }

  update(game, ms) {
    if (!this.enabled) return;

    const lvl = game.currentLevel;

    if (!lvl) return;

    this.props = [
      game.FPS.toFixed(1) + " FPS",
      "Renderer: " + game.renderer.type,
      "Level: " + lvl.name,
      "loaded: " + lvl.loaded,
      "layers: " + lvl.layers.length,
      "entities: " + lvl.entities.length,
      "particles: " + lvl.particleSystem.particles.length,
      "camera pos: " +
        "x " +
        lvl.camera.position.x.toFixed(3) +
        " y " +
        lvl.camera.position.y.toFixed(3),
      "camera scale: " + lvl.camera.scale,
    ];
  }

  hide() {
    this.style.display = "none";
  }

  show() {
    this.style.display = "block";
    this.render();
  }

  render() {
    const ctx = this.context;
    const canvas = ctx.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < this.props.length; i++) {
      this.drawRow(ctx, i, this.props[i]);
    }

    if (this.enabled) {
      requestAnimationFrame(this.render.bind(this));
    }
  }

  drawRow(ctx, row, value) {
    const fontSize = 14;
    ctx.fillStyle = "white";
    ctx.font = fontSize + "px sans-serif";
    ctx.fillText(value, 5, fontSize + fontSize * row * 1.2);
  }
}

customElements.define("hud-dev", Dev);

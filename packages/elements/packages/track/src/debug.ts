import type { Track, Trait } from "./Track.js";

const PI2 = Math.PI * 2;

/**
 * Debug trait for debugging hud.
 */
export class DebugTrait implements Trait {
  id = "debug";

  input(track, state) {
    console.debug(state);
  }

  update(track: Track): void {
    if (!track.debug) return;

    const meta = {
      position: track.position,
      origin: track.origin,
      mouseDown: track.mouseDown,
      grabbing: track.grabbing,
      acceleration: track.acceleration,
      velocity: track.velocity,
      drag: track.drag,
      moveVelocity: track.moveVelocity,
      inputForce: track.inputForce,
      mousePos: track.mousePos,
      target: track.target,
      scrollDebounce: track.scrollDebounce,
    };

    console.debug(meta);

    const trackSize = track.trackSize;
    const currentAngle = track.currentAngle;

    const canvas = track.debugCanvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(0.5, 0.5);
    canvas.width = track.width * 2;
    canvas.height = track.height * 2;
    canvas.style.width = `${track.width}px`;
    canvas.style.height = `${track.height}px`;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, 400, 700);

    const originAngle = track.originAngle;

    let angle = 0;
    for (let i = -1; i < track.itemCount + 1; i++) {
      const itemAngle = track.itemAngles[i] || 0;
      angle += itemAngle;

      // draw a line from the center to the current position with angle
      ctx.strokeStyle = `hsl(0, 0%, ${(i / track.itemCount) * 100}%)`;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(100 + Math.cos(angle) * 69, 100 + Math.sin(angle) * 69);
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // draw a line from the center to the current position with angle
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(
      100 + Math.cos(currentAngle + originAngle) * 69,
      100 + Math.sin(currentAngle + originAngle) * 69,
    );
    ctx.arc(
      100,
      100,
      69,
      currentAngle + originAngle,
      currentAngle + originAngle + (track.width / trackSize) * PI2,
    );
    ctx.lineTo(100, 100);
    ctx.fill();

    // print current position
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `${track.currentPosition?.toFixed(1)} / ${trackSize?.toFixed(1)}`,
      42,
      18,
    );

    // print current position index
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(track.currentItem.toString(), 6, 18);

    if (track.targetAngle) {
      // draw a line from the center to the current position with angle
      ctx.strokeStyle = "blue";
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(
        100 + Math.cos(track.targetAngle) * 50,
        100 + Math.sin(track.targetAngle) * 50,
      );
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // draw a line from the center to the current position with angle
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(100 + Math.cos(originAngle) * 69, 100 + Math.sin(originAngle) * 69);
    ctx.lineWidth = 3;
    ctx.stroke();

    let line = 6;
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    for (const key in meta) {
      ctx.fillText(`${key}: ${meta[key]}`, 6, 24 * 1.5 * line);
      line++;
    }
  }
}

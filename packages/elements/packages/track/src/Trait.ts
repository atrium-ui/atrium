import type { InputState, Track } from "./Track.js";

export class Trait {
  id: string;
  enabled = false;

  entity: Track;

  constructor(id, entity, defaultEnabled = false) {
    this.id = id;
    this.enabled = defaultEnabled;
    this.entity = entity;

    this.created();
  }

  created() {
    // ...
  }

  start() {
    // called on animation start
  }

  stop() {
    // called on animation stop
  }

  input(inputState: InputState) {
    // input tick
  }

  update() {
    // update tick (fixed tickrate)
  }
}

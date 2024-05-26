/* @jsxImportSource vue */
import "@sv/elements/animation";
import riveWASMResource from "@rive-app/canvas/rive.wasm?url";
import * as rive from "@rive-app/canvas";

if (typeof window !== "undefined") {
  rive.RuntimeLoader.setWasmUrl(riveWASMResource);
}

export function Animation(props: {
  src: string;
  width?: number;
  height?: number;
}) {
  return (
    <a-animation
      height={props.height || 400}
      width={props.width || 400}
      src={props.src}
      stateMachine="State Machine 1"
    />
  );
}

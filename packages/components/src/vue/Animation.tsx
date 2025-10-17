/* @jsxImportSource vue */
import { AnimationElement } from "@sv/animation";
import riveWASMResource from "@rive-app/canvas-advanced-lite/rive.wasm?url";
AnimationElement.riveWasm = riveWASMResource;

export function Animation(props: { src: string; width?: number; height?: number }) {
  return (
    <a-animation
      height={props.height || 400}
      width={props.width || 400}
      src={props.src}
    />
  );
}

/* @jsxImportSource vue */

import "@sv/elements/animation";

type AnimationProps = {
  src: string;
  width?: number;
  height?: number;
};

export function Animation(props: AnimationProps) {
  return (
    <div>
      <a-animation
        height={props.height || 400}
        width={props.width || 400}
        src={props.src}
        stateMachine="State Machine 1"
      />
    </div>
  );
}

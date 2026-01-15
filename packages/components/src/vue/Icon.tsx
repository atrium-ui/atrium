/* @jsxImportSource vue */
import "@sv/svg-sprites/svg-icon";

export function Icon(props: { name: keyof typeof ICONS; class?: string | string[] }) {
  return (
    <svg-icon
      aria-hidden="true"
      class={[
        "flex-none aspect-square h-[1em] w-[1em]",
        props.class,
      ]}
      name={props.name || 'unknown'}
    />
  );
}

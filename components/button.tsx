// copy pasteable ui component
// import "@atrium-ui/mono/components/dropdown";

// adapter pattern to be useable in vue, solid, and react components
export default function Button({ children }, { slots }) {
  return (
    <button class="py-3 px-6">
      <slot></slot>
    </button>
  );
}

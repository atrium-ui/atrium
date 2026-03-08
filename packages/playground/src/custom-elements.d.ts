import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "sv-code-editor": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }

  interface HTMLAttributes<T> {
    language?: string;
  }
}

// solid.js
type ElementProps<T> = {
  [K in keyof T]: CustomElementProps<T[K]>;
};

type CustomElementChildren = Element | Element[] | JSX.Element | JSX.Element[];

type CustomElementProps<T> = {
  [K in keyof Omit<T, "children"> as string & K]?: T[K];
} & { children?: CustomElementChildren; class?: string };

interface CustomElements extends ElementProps<HTMLElementTagNameMap> {}

// react/next and vue (for some reason)
declare namespace JSX {
  interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
}

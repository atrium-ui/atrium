// solid.js
type ElementProps<T> = {
  [K in keyof T]: Props<T[K]>;
};

type Props<T> = {
  [K in keyof Omit<T, "children"> as string & K]?: T[K];
} & { children?: any | any[] };

interface AtriumElements extends ElementProps<HTMLElementTagNameMap> {}

// react/next
declare namespace JSX {
  type ElementProps<T> = {
    [K in keyof T]: Props<T[K]>;
  };

  type Props<T> = {
    [K in keyof Omit<T, "children"> as string & K]?: T[K];
  } & { children?: Element | Element[] };

  interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
}

// import "solid-js";

// export namespace JSX {
//   type ElementProps<T> = {
//     [K in keyof T]: Props<T[K]> & HTMLAttributes<T[K]>;
//   };
//   type Props<T> = {
//     [K in keyof Omit<T, "children"> as string & K]?: T[K];
//   };
//   interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
// }

// declare module "solid-js" {
//   namespace JSX {
//     type ElementProps<T> = {
//       [K in keyof T]: Props<T[K]> & HTMLAttributes<T[K]>;
//     };
//     type Props<T> = {
//       [K in keyof Omit<T, "children"> as string & K]?: T[K];
//     };
//     interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
//   }
// }

type ElementProps<T> = {
  [K in keyof T]: Props<T[K]> & HTMLAttributes<T[K]>;
};
type Props<T> = {
  [K in keyof Omit<T, "children"> as string & K]?: T[K];
};
interface AtriumElements extends ElementProps<HTMLElementTagNameMap> {}

// declare global {
// export namespace JSX {
//   type ElementProps<T> = {
//     [K in keyof T]: Props<T[K]>;
//   };
//   type Props<T> = {
//     [K in keyof T & { children: Element[] } as string & K]?: T[K];
//   };
//   interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
// }
// }

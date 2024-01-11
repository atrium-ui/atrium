type ElementProps<T> = {
	[K in keyof T]: CustomElementProps<T[K]>;
};

type CustomElementChildren = Element | Element[] | JSX.Element | JSX.Element[];

type CustomElementProps<T> = {
	[K in keyof Omit<T, 'children'> as string & K]?: T[K];
} & {
	children?: CustomElementChildren;
	class?: string;
	onChange?: (e: Event) => void;
	// TODO: merge with default react props
};

type CustomElements = ElementProps<HTMLElementTagNameMap>;

namespace JSX {
	namespace JSX {
		// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
		interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
	}
}

declare module 'solid-js' {
	namespace JSX {
		// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
		interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
	}
}

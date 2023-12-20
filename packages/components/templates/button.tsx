// copy pasteable ui component
// import "@sv/components/dropdown";

const variants = {
	outline: 'rounded-lg border border-[#C09278] px-6 py-2 bg-transparent',
	solid: 'rounded-lg bg-[#C09278] px-6 py-2 active:bg-[rgba(158,118,96,1)]',
	ghost: 'p-2 flex items-center gap-2 text-2xl hover:text-[#C09278]',
};

interface Props {
	type?: 'button' | 'submit';
	children?: JSX.Element | string;
	variant?: keyof typeof variants;
}

// adapter pattern to be useable in vue, solid, and react components

// TODO: shouldnt destruct props because of solid js compat
export function Button(props: Props, context) {
	const slots = {
		default: () =>
			props.children ? props.children : context?.slots?.default ? context?.slots.default() : null,
	};

	return (
		<button
			type={props.type || 'button'}
			class={`cursor-pointer ${variants[props.variant ?? 'solid']}`}
		>
			<slots.default />
		</button>
	);
}

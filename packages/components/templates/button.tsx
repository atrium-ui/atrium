const variants = {
	default: [
		'bg-[var(--button-color,#C09278)]',
		'filter hover:brightness-110 active:brightness-90 active:contrast-125',
		'border border-[var(--button-color,#C09278)]',
		'disabled:opacity-80 disabled:text-white disabled:filter-none',
	].join(' '),
	outline: [
		'bg-transparent hover:bg-[rgba(150,150,150,0.1)]',
		'filter hover:brightness-110 active:brightness-90 active:contrast-125',
		'border border-[var(--button-color,#C09278)]',
		'disabled:opacity-80 disabled:text-white disabled:filter-none',
	].join(' '),
	_ghost: 'bg-transparent p-2 flex items-center gap-2 hover:text-[#C09278]',
	ghost: [
		'bg-transparent active:bg-[rgba(150,150,150,0.1)]',
		'filter hover:brightness-110',
		'disabled:opacity-80 disabled:text-white disabled:filter-none',
	].join(' '),
};

interface Props {
	type?: 'button' | 'submit';
	disabled?: boolean;
	children?: JSX.Element | string;
	variant?: keyof typeof variants;
	slot?: string;
	class?: string;
	onClick?: (e: PointerEvent) => void;
}

export function Button(props: Props, context) {
	const slots = {
		default: () =>
			props.children ? props.children : context?.slots?.default ? context?.slots.default() : null,
	};

	return (
		<button
			type={props.type || 'button'}
			slot={props.slot}
			disabled={props.disabled || undefined}
			class={[
				'flex gap-2 items-center cursor-pointer disabled:cursor-not-allowed',
				'px-5 py-1 rounded-lg transition-all active:transition-none',
				variants[props.variant ?? 'default'],
				props.class,
			].join(' ')}
			onClick={props.onClick}
		>
			<slots.default />
		</button>
	);
}

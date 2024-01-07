import '@sv/elements/popover';

export function Combobox(
	props: {
		children?: JSX.Element | string;
		label: string;
	},
	context
) {
	const slots = {
		default: () =>
			props.children ? props.children : context?.slots?.default ? context?.slots.default() : null,
	};

	return (
		<a-popover class="group">
			<button
				type="button"
				slot="input"
				class="cursor-pointer rounded-lg bg-[#C09278] px-4 py-1
              active:bg-[rgba(158,118,96,1)] text-left"
			>
				{props.label}
			</button>

			<div
				class="rounded-md bg-zinc-800 border border-zinc-700 p-4 mt-1 w-80
                transition-all
                opacity-0 group-[&[opened]]:opacity-100"
			>
				<slots.default />
			</div>
		</a-popover>
	);
}

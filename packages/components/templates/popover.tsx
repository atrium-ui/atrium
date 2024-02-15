import '@sv/elements/popover';

import { Button } from './button.jsx';

export function Popover(
	props: {
		children?: JSX.Element | string;
		label: string;
	},
	context
) {
	const slots = {
		default: () =>
			props.children
				? props.children
				: context?.slots?.default
				  ? context?.slots.default()
				  : null,
	};

	return (
		<a-popover class="group relative z-10">
			<Button slot="input">{props.label}</Button>

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

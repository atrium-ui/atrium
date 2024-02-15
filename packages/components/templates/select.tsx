import "@sv/elements/dropdown";
import "@sv/elements/expandable";

import { Button } from "./button.jsx";

export function Select(
	props: {
		children?: JSX.Element | string;
		value: string;
	},
	context,
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
		<div onSelect={(e) => console.log(e.option.value)}>
			<a-dropdown class="relative inline-block">
				<Button slot="input" class="w-[150px]">
					{props.value}
				</Button>

				<div class="rounded-md bg-zinc-800 border border-zinc-700 p-1 mt-1">
					<slots.default />
				</div>
			</a-dropdown>
		</div>
	);
}

Select.Item = function Item(props: { value: string }) {
	return (
		<a-option
			class="hover:bg-zinc-600 active:bg-zinc-700 [&[selected]]:bg-zinc-700 rounded-md"
			value={props.value}
		>
			<button
				type="button"
				class="group cursor-pointer w-full flex items-center justify-start bg-transparent"
			>
				<div>{props.value}</div>
			</button>
		</a-option>
	);
};

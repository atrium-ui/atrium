import "@sv/elements/dropdown";
import "@sv/elements/toggle";
import "@sv/elements/expandable";

import { Button } from "./button.jsx";

function CheckIcon() {
	return (
		<svg
			class="stroke-current block"
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			viewBox="0 0 17.121 13.141"
		>
			<title>Checkmark</title>
			<path
				d="M683,754.437l5.041,5.041L698,749.518"
				transform="translate(-681.939 -748.457)"
				fill="none"
				stroke-width="3"
			/>
		</svg>
	);
}

export function Combobox(
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
		<div onInput={(e) => console.log(e.target.value)}>
			<a-dropdown class="relative inline-block">
				<Button slot="input" class="w-[150px]">
					{props.value}
				</Button>

				<div class="rounded-md bg-zinc-800 border border-zinc-700 p-1 mt-1">
					<a-toggle multiple>
						<slots.default />
					</a-toggle>
				</div>
			</a-dropdown>
		</div>
	);
}

Combobox.Item = function Item(props: { value: string }) {
	return (
		<button
			type="button"
			value={props.value}
			class="group cursor-pointer w-full flex items-center justify-start
            rounded-md bg-transparent hover:bg-zinc-600 active:bg-zinc-700"
		>
			<div class="opacity-0 group-[&[selected]]:opacity-100 ml-1 mr-2">
				<CheckIcon />
			</div>
			<div>{props.value}</div>
		</button>
	);
};

import '@sv/elements/dropdown';
import '@sv/elements/expandable';

interface Props {
	children?: JSX.Element | string;
	value: string;
}

export function Filter(props: Props, context) {
	const slots = {
		default: () =>
			props.children
				? props.children
				: context?.slots?.default
				  ? context?.slots.default()
				  : null,
	};

	return (
		<div
			onInput={(e) => console.log(e.target.value)}
			class="p-1 bg-zinc-800 rounded-lg border border-zinc-700"
		>
			<a-dropdown class="block" style="--dropdown-position: static;">
				<input
					slot="input"
					class="rounded-md bg-transparent px-3 py-1 text-left min-w-[500px] outline-none"
					onInput="handleFilter"
					placeholder="Type to filter..."
					value={props.value}
				/>

				<div class="p-1 max-h-[200px]">
					<slots.default />
				</div>
			</a-dropdown>
		</div>
	);
}

Filter.Item = function Item(props: { value: string }) {
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

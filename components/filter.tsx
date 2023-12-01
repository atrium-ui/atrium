import '@sv/elements/dropdown';
import '@sv/elements/toggle';

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

function Item(props: { value: string }) {
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
}

export default function Combobox(props: {
	value: string;
}) {
	return (
		<div onInput={(e) => console.log(e.target.value)}>
			<a-dropdown onSelect="handleSelect">
				<input slot="input" v-model="state.value" onInput="handleFilter" placeholder="Text" />

				<a-toggle>
					<Item value="Item1" />
					<Item value="Item2" />
					<Item value="Item3" />
				</a-toggle>
			</a-dropdown>
		</div>
	);
}

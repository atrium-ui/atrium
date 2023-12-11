import '@sv/elements/toggle';

function CheckIcon() {
	return (
		<svg
			class="stroke-current block"
			xmlns="http://www.w3.org/2000/svg"
			width="17.121"
			height="13.141"
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

interface Props {
	id: string;
	checked: boolean;
}

export default function Accordion(props: Props) {
	return (
		<div class="grid grid-cols-[auto_auto] gap-3">
			<a-toggle active-attribute="data-selected">
				<button
					type="button"
					class="group w-7 h-7 p-0 bg-transparent rounded-md cursor-pointer
              border border-zinc-700 hover:border-zinc-600"
					id={props.id}
					data-selected={props.checked}
				>
					<div class="items-center justify-center hidden group-[&[data-selected]]:flex">
						<CheckIcon />
					</div>
				</button>
			</a-toggle>

			<div>
				<label for={props.id} class="text-lg cursor-pointer">
					I agree to use this checkbox
				</label>
				<p class="text-base">This is still work in progress.</p>
			</div>
		</div>
	);
}

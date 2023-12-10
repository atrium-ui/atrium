interface Props {
	placeholder: string;
	label: string;
	error: string;
}

export default function Accordion(props: Props) {
	return (
		<div>
			<div class="text-sm mb-1">
				<label>{props.label}</label>
			</div>
			<input
				type="text"
				placeholder={props.placeholder}
				class={`group px-3 py-1 bg-transparent rounded-md outline-none border
        hover:border-zinc-600 focus:border-zinc-500 ${
					props.error ? 'border-red-600' : 'border-zinc-700'
				}`}
			/>
			{props.error ? (
				<div class="text-sm mt-1 text-red-600">
					<label>{props.error}</label>
				</div>
			) : null}
		</div>
	);
}

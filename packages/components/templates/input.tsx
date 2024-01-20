interface Props {
	placeholder?: string;
	label?: string;
	error?: string;
	required?: boolean;
	multiline?: boolean;
	onInvalid?: (e: Event) => void;
	onInput?: (e: Event) => void;
	onChange?: (e: Event) => void;
}

// TODO: I think this input should be a custom-element.
// - Without label.
// - Need to think about how to position the error message.
export function Input(props: Props) {
	return (
		<div>
			<div class="text-sm mb-1">
				<label>{props.label}</label>
			</div>

			{props.multiline ? (
				<textarea
					type="text"
					required={props.required || undefined}
					placeholder={props.placeholder}
					class={[
						'group px-3 py-1 bg-transparent rounded-md outline-none border hover:border-zinc-600 focus:border-zinc-500 resize-y w-full',
						props.error ? 'border-red-600' : 'border-zinc-700',
					].join(' ')}
					onChange={(e) => {
						props.onChange?.(e);
					}}
					onInput={(e) => {
						props.onInput?.(e);
					}}
					onInvalid={(e) => {
						const err = props.onInvalid?.(e);
						e.preventDefault();
					}}
				/>
			) : (
				<input
					type="text"
					required={props.required || undefined}
					placeholder={props.placeholder}
					class={[
						'group px-3 py-1 bg-transparent rounded-md outline-none border hover:border-zinc-600 focus:border-zinc-500 min-w-0 w-full',
						props.error ? 'border-red-600' : 'border-zinc-700',
					].join(' ')}
					onChange={(e) => {
						props.onChange?.(e);
					}}
					onInput={(e) => {
						props.onInput?.(e);
					}}
					onInvalid={(e) => {
						const err = props.onInvalid?.(e);
						e.preventDefault();
					}}
				/>
			)}

			{props.error ? (
				<div class="text-sm mt-1 text-red-600">
					<label>{props.error}</label>
				</div>
			) : null}
		</div>
	);
}

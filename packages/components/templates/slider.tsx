import '@sv/elements/toggle';
import '@sv/elements/track';

interface Props {
	children?: JSX.Element | string;
}

function Dot() {
	return (
		<button
			type="button"
			class="w-4 h-4 bg-zinc-400 rounded-full cursor-pointer [&[selected]]:bg-white"
		/>
	);
}

export function Slider(props: Props, context) {
	const slots = {
		default: () =>
			props.children ? props.children : context?.slots?.default ? context?.slots.default() : null,
	};

	return (
		<div>
			<a-track snap class="flex w-full">
				<slots.default />
			</a-track>

			<a-toggle
				class="flex gap-2 justify-center mt-4"
				onchange={(e) => {
					console.log(e);
				}}
			>
				<Dot />
				<Dot />
				<Dot />
			</a-toggle>
		</div>
	);
}

import { Input } from './input.jsx';
import { Button } from './button.jsx';

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface Props {}

export function Form(props: Props) {
	return (
		<form
			class="flex flex-col justify-between"
			onSubmit={async (e) => {
				e.preventDefault();
			}}
		>
			<Input
				onInvalid={(e) => {
					console.log(e);
				}}
			/>

			<Button type="submit">Submit</Button>
		</form>
	);
}

import { Button } from './button.jsx';

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface Props {}

export function ImageText(props: Props) {
	return (
		<div class="grid grid-cols-[auto_1fr] gap-8">
			<div>
				<img src="https://picsum.photos/300/300" width="300" height="300" alt="" load="async" />
			</div>
			<div>
				<h1>Image Text</h1>
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas asperiores, quisquam,
					voluptates, voluptatum quibusdam accusantium quos voluptatem quia doloribus quidem
					provident. Quisquam, voluptatem. Quisquam, voluptatem.
				</p>

				<div class="pt-10">
					<Button>Button</Button>
				</div>
			</div>
		</div>
	);
}

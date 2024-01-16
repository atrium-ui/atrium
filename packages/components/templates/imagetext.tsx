import { Button } from './button.jsx';

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface Props {}

export function ImageText(props: Props) {
	return (
		<div class="grid grid-cols-10 xl:grid-cols-8 grid-gap !gap-y-10">
			<div class="col-span-10 md:col-span-6 lg:col-span-7 xl:col-span-5">
				<h3 class="text-4xl pb-6">Image Text</h3>
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas asperiores, quisquam,
					voluptates, voluptatum quibusdam accusantium quos voluptatem quia doloribus quidem
					provident. Quisquam, voluptatem. Quisquam, voluptatem.
				</p>

				<div class="pt-10">
					<Button>Button</Button>
				</div>
			</div>

			<div class="col-start-6 col-span-6 md:col-span-4 lg:col-span-3 md:pl-10">
				<figure>
					<img
						class="w-full h-auto"
						src="https://picsum.photos/300/300"
						width="300"
						height="300"
						alt="alt"
						load="async"
					/>
					<figcaption class="text-sm">
						<p>Caption</p>
					</figcaption>
				</figure>
			</div>
		</div>
	);
}

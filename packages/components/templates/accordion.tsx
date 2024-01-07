import '@sv/elements/expandable';
import '@sv/elements/toggle';

interface Props {
	items: { title: string; content: string }[];
}

function ExpandIcon() {
	return (
		<svg class="fill-current" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
			<title>Expand</title>
			<path d="M8.6,20v-8.5H0V8.6h8.6V0h2.9v8.6H20v2.9h-8.6V20H8.6z" />
		</svg>
	);
}

export function Accordion(props: Props) {
	return (
		<a-toggle active-attribute="opened">
			{props.items.map((item) => {
				return (
					<a-expandable class="accordion">
						<div slot="toggle">
							<button
								type="button"
								class="p-2 w-full bg-transparent flex justify-between items-center cursor-pointer"
							>
								<div class="headline">
									<span>{item.title}</span>
								</div>
								<ExpandIcon />
							</button>
						</div>

						<div class="p-2">{item.content}</div>
					</a-expandable>
				);
			})}
		</a-toggle>
	);
}

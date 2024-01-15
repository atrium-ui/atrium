import '@sv/elements/blur';
import { Track, Trait } from '@sv/elements/track';
import { PointerTrait } from '../../elements/packages/track/src/traits/Pointer.js';

interface Props {
	children?: JSX.Element | string;
	enabled: boolean;
}

class DrawerTrack extends Track {
	connectedCallback(): void {
		super.connectedCallback();

		this.drag = 0;

		const pointer = this.findTrait<PointerTrait>('pointer');
		if (pointer) {
			pointer.borderResistnce = 0;
		}

		this.addTrait(
			'drawer',
			class extends Trait {
				input() {
					if (this.entity.position.y < -210) {
						this.entity.dispatchEvent(new Event('close', { bubbles: true }));
					}
				}
			},
			true
		);
	}
}
customElements.define('drawer-track', DrawerTrack);

export function Drawer(props: Props, context) {
	const slots = {
		default: () =>
			props.children ? props.children : context?.slots?.default ? context?.slots.default() : null,
	};

	return (
		<a-blur
			enabled={props.enabled || undefined}
			class="group/blur block fixed z-50 top-0 left-0 w-full h-full transition-all
           [&[enabled]]:bg-[#1C1C1C33] [&[enabled]]:backdrop-blur-md"
		>
			<drawer-track
				vertical
				class="fixed z-50 bottom-0 left-1/2 -translate-x-1/2
							transition-all translate-y-full group-[&[enabled]]/blur:translate-y-0
							opacity-0 group-[&[enabled]]/blur:opacity-100
							group-[&[enabled]]/blur:block"
			>
				<div
					class="py-4 px-8 min-w-[250px] w-[calc(100vw-20px)] max-w-[500px]
                rounded-t-lg bg-zinc-800 border-b-0 border border-zinc-700"
				>
					<div class="w-full flex justify-center pb-4">
						<div class="w-[100px] h-[4px] bg-white rounded-3xl opacity-50" />
					</div>

					<a-adaptive>
						<slots.default />
					</a-adaptive>
				</div>
			</drawer-track>
		</a-blur>
	);
}

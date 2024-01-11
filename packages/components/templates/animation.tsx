import '@sv/elements/animation';

type AnimationProps = {
	src: string;
	width?: number;
	height?: number;
};

export function Animation(props: AnimationProps) {
	return (
		<div>
			<a-animation height={props.height || 200} width={props.width || 200} src={props.src} />
		</div>
	);
}

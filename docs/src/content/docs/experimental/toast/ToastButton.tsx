import { Button } from "@sv/components/templates/button";
import { Toasts } from "@sv/elements/toast";

export function ToastButton() {
	return (
		<div>
			<Button
				onClick={() => {
					Toasts.info("Hello, World!");
				}}
			>
				Click
			</Button>

			<a-toast-feed />
		</div>
	);
}

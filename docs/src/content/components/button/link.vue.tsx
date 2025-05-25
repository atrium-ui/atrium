/* @jsxImportSource vue */
import { Link } from "@components/src/vue/Button";

export default function () {
  return (
    <div class="flex gap-10 text-white">
      <Link variant="default" href="https://google.com" target="_blank">
        To somewhere
      </Link>
      <Link variant="outline" href="https://bing.com" target="_blank">
        To somewhere else
      </Link>
    </div>
  );
}

import "@atrium-ui/mono/dropdown";
import "@atrium-ui/mono/toggle";

interface Props {}

export default function Combobox(props: Props) {
  return (
    <a-dropdown>
      <button type="button" slot="input">
        {"Select"}
      </button>

      <a-toggle multiple>
        <button type="button" class="block">
          X
        </button>
        <button type="button" class="block">
          X
        </button>
        <button type="button" class="block">
          X
        </button>
        <button type="button" class="block">
          X
        </button>
      </a-toggle>
    </a-dropdown>
  );
}

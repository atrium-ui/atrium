import "@atrium-ui/mono/expandable";
import "@atrium-ui/mono/toggle";

interface Props {
  items: { title: string; content: string }[];
}

function ExpandIcon() {
  return (
    <div class="fill-current">
      <svg width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M8.6,20v-8.5H0V8.6h8.6V0h2.9v8.6H20v2.9h-8.6V20H8.6z"></path>
      </svg>
    </div>
  );
}

// adapter pattern to be useable in vue, solid, and react components

// TODO: shouldnt destruct props because of solid js compat
export default function Accordion(props: Props) {
  return (
    <a-toggle active-attribute="opened">
      {props.items.map((item) => {
        return (
          <a-expandable class="accordion">
            <div slot="toggle">
              <button
                type="button"
                class="p-2 w-full bg-transparent flex justify-between cursor-pointer"
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

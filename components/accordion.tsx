// import '@atrium-ui/mono';

interface Props {
  items?: { title: string; content: string }[];
}

function ExpandIcon() {
  return (
    <div class="accordion-collapse-icon">
      <svg class="plus-icon" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M8.6,20v-8.5H0V8.6h8.6V0h2.9v8.6H20v2.9h-8.6V20H8.6z"></path>
      </svg>
      <svg class="minus-icon" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M0,11.5V8.6h20v2.9H0z"></path>
      </svg>
    </div>
  );
}

// adapter pattern to be useable in vue, solid, and react components
export default function Button({ items }: Props, context) {
  return (
    <a-toggle client:load active-attribute="opened">
      <a-expandable class="accordion">
        <div slot="toggle">
          <button class="accordion-title">
            <div class="headline">
              <span>Toggle</span>
            </div>
            <ExpandIcon />
          </button>
        </div>

        <div class="accordion-content">{paragraph(4)}</div>
      </a-expandable>

      <a-expandable class="accordion">
        <div slot="toggle">
          <button class="accordion-title">
            <div class="headline">Toggle</div>
            <ExpandIcon />
          </button>
        </div>

        <div class="accordion-content">{paragraph(4)}</div>
      </a-expandable>
    </a-toggle>
  );
}

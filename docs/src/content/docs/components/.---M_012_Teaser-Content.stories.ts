import { html, nothing } from "lit";

function renderImage(aspect: string) {
  return html`
    ${(aspect === "16/9" && html`<fra-image aspect="16/9" slot="image" src="https://placehold.co/640x360"></fra-image>`) || ""}
    ${(aspect === "4/3" && html`<fra-image aspect="4/3" slot="image" src="https://placehold.co/640x480"></fra-image>`) || ""}
    ${(aspect === "1/1" && html`<fra-image aspect="1/1" slot="image" src="https://placehold.co/640x640"></fra-image>`) || ""}
  `;
}

export default {
  tags: ["public"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    aspect: "16/9",
    cols: "3",
    highlight: false,
    headline: "Lorem ipsum dolor sit amet consetetur sadipscing elitr (T3)",
    copy: "(Body) Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum ...",
    href: "#",
    target: "",
    count: 3,
  },
  argTypes: {
    aspect: {
      options: ["1/1", "4/3", "16/9"],
      control: {
        type: "select",
      },
    },
    cols: {
      options: ["2", "3"],
      control: {
        type: "select",
      },
    },
    highlight: {
      description: "Any teaser can have the highlighted state",
    },
    headline: {
      // description: "Should not exceed XX characters.", // tbd
    },
    copy: {
      // description: "Should not exceed XX characters.", // tbd
    },
  },
  render: (args) => {
    return html`
      <fra-grid>
        <fra-limited-list limit=${args.limit || 9} steps=${args.steps || 6}>
          ${new Array(args.count).fill(1).map((_, i) => {
            return html`
              <fra-teaser href=${args.href} target=${args.target} class=${args.cols === "2" ? "col-1/2" : "col-1/3"} ?highlight=${args.highlight && i === 0}>
                ${renderImage(args.aspect)}
                <h3>${args.headline}</h3>
                <p>${args.copy}</p>
              </fra-teaser>
            `;
          })}

          <div slot="showmore">
            <fra-button>Load More</fra-button>
          </div>
        </fra-limited-list>
      </fra-grid>
    `;
  },
};

export const Default = {};

export const Hightlight = {
  args: {
    highlight: true,
  },
};

export const Bild_16x19 = {
  args: {
    aspect: "16/9",
  },
};

export const Bild_4x3 = {
  args: {
    aspect: "4/3",
  },
};

export const Bild_1x1 = {
  args: {
    aspect: "1/1",
  },
};

export const TwoColumns = {
  args: {
    cols: "2",
    count: 2,
  },
};

export const ThreeColumns = {
  args: {
    cols: "3",
  },
};

export const ThreeColumnsLimited = {
  args: {
    limit: 9,
    steps: 6,
    highlight: true,
    headline:
      "Aliquip incididunt mollit laborum laboris consectetur. Pariatur reprehenderit consequat amet ex occaecat eu duis est cillum id.",
    copy: "Do labore sit nostrud dolore officia amet eu voluptate deserunt occaecat. Nulla occaecat laboris do et do duis. Duis elit adipisicing nisi excepteur enim occaecat magna eiusmod ullamco occaecat ullamco culpa. Eu non voluptate proident consequat exercitation laboris qui do veniam magna. Amet elit elit nostrud ea consectetur anim ut veniam velit deserunt cupidatat. Elit reprehenderit est sit sit nostrud velit veniam ea voluptate ex esse quis. Cillum veniam Lorem quis.",
    count: 20,
  },
};

export const TwoColumnsLimited = {
  args: {
    limit: 8,
    steps: 6,
    cols: "2",
    highlight: true,
    headline:
      "Aliquip incididunt mollit laborum laboris consectetur. Pariatur reprehenderit consequat amet ex occaecat eu duis est cillum id.",
    copy: "Do labore sit nostrud dolore officia amet eu voluptate deserunt occaecat. Nulla occaecat laboris do et do duis. Duis elit adipisicing nisi excepteur enim occaecat magna eiusmod ullamco occaecat ullamco culpa. Eu non voluptate proident consequat exercitation laboris qui do veniam magna. Amet elit elit nostrud ea consectetur anim ut veniam velit deserunt cupidatat. Elit reprehenderit est sit sit nostrud velit veniam ea voluptate ex esse quis. Cillum veniam Lorem quis.",
    count: 20,
  },
};

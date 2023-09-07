import "@atrium-ui/mono/command";

interface Props {
  children?: JSX.Element | string;
}

function Prefix() {
  return (
    <svg height="12px" viewBox="0 0 165 165" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M49 150L117 82L49 14"
        stroke="currentColor"
        stroke-width="24"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export default function Command(props: Props, context) {
  return (
    <div class="absolute w-full h-full flex justify-center items-center">
      <a-command shortcut="Space" placeholder="Search">
        <div class="prefix" slot="before-input">
          <Prefix />
        </div>

        <div class="item [&[selected]]:bg-white">Some Item 1</div>
        <div class="item [&[selected]]:bg-white">Some Item 1</div>
        <div class="item [&[selected]]:bg-white">Some Item 1</div>
        <div class="item [&[selected]]:bg-white">Some Item 1</div>
        <div class="item [&[selected]]:bg-white">Some Item 1</div>
      </a-command>
    </div>
  );
}

import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import Button from '../components/button';

const App = () => {
  const [count, setCount] = createSignal(0);

  setInterval(() => setCount(count() + 1), 1000);

  return (
    <div class="p-10">
      <Button>
        <span>Click me</span>
      </Button>
    </div>
  );
};

render(App, document.body);

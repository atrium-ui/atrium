// biome-ignore lint/complexity/useArrowFunction: <explanation>
const registerElementFunction = function (tag, ElementConstructor) {
  if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.on("vite:afterUpdate", () => {
      for (const node of document.querySelectorAll(tag)) {
        // Swap prototype of instance with new one
        Object.setPrototypeOf(node, ElementConstructor.prototype);
        // re-render
        node.connectedCallback?.();
        node.requestUpdate?.();
      }
    });

    try {
      customElements.define(tag, ElementConstructor);
    } catch (err) {}
  } else {
    customElements.define(tag, ElementConstructor);
  }
};

const prelude = () => `const __defineElement = ${registerElementFunction.toString()};`;

const defineRegex = /customElements\.define\((["a-zA-Z-]+),\s+([a-zA-Z]+)\)?;/g;

export default () => {
  return {
    name: "custom-elements-hmr",

    transform(code, id) {
      if (id.match("node_modules")) return;

      const matches = [...code.matchAll(defineRegex)];

      if (matches.length > 0) {
        code = `${prelude()}\n${code}`;

        for (const [str, tag, elementName] of matches) {
          code = code.replace(str, `__defineElement(${tag}, ${elementName});`);
        }
      }

      return { code };
    },
  };
};

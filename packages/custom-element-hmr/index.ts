const transformDefine = (tag, Element) => `
if (import.meta.hot) {
  function define(tag, ElementConstructor) {
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
  }

  define(${tag}, ${Element});
} else {
  customElements.define(${tag}, ${Element});
}
`;

const defineRegex = /customElements\.define\((["a-zA-Z-]+),\s+([a-zA-Z]+)\)?;/g;

export default () => {
  return {
    name: "vite:custom-elements-hmr",
    enforce: "pre",
    apply: "serve",

    transform(code, id, options) {
      const ssr = typeof options === "object" ? options.ssr : options;
      if (ssr || id.match("node_modules")) {
        return;
      }

      const matches = [...code.matchAll(defineRegex)];
      if (matches.length === 0) {
        return;
      }

      let output = code;

      for (const [str, tag, Element] of matches) {
        output = output.replace(str, transformDefine(tag, Element));
      }

      return { code: output };
    },
  };
};

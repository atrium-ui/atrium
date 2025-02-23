import "./Playground.css";

export function Playground() {
  async function init() {
    const monaco = await import("monaco-editor/esm/vs/editor/editor.main.js");

    customElements.define(
      "code-view-monaco",
      class CodeViewMonaco extends HTMLElement {
        _monacoEditor;
        _editor;

        constructor() {
          super();

          const shadowRoot = this.attachShadow({ mode: "open" });

          // Copy over editor styles
          const styles = document.querySelectorAll(
            "link[rel='stylesheet'][data-name^='vs/']",
          );
          for (const style of styles) {
            shadowRoot.appendChild(style.cloneNode(true));
          }

          const template = document.createElement("template");
          template.innerHTML = `
            <div
          		id="container"
          		style="width: 100%; height: 100%; position: absolute"
           	></div>
          `;
          shadowRoot.appendChild(template.content.cloneNode(true));

          this._editor = shadowRoot.querySelector("#container");
          this._monacoEditor = monaco.editor.create(this._editor, {
            automaticLayout: true,
            language: "html",

            value: `<div>Hello World</div>`,
          });
        }
      },
    );
  }

  init();

  return (
    <div>
      <h1>Playground</h1>
      <p>This is a playground for testing components</p>

      <code-view-monaco />
    </div>
  );
}

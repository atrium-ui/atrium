import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { tags } from "@lezer/highlight";

type EditorLanguage = "html" | "tsx";

const atriumTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#ffffff",
      color: "#3b1d0f",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#ea580c",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#ea580c",
    },
    ".cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#ffedd5",
    },
    ".cm-panels": {
      backgroundColor: "#ffffff",
      color: "#3b1d0f",
    },
    ".cm-gutters": {
      backgroundColor: "#ffffff",
      color: "#c2410c",
      borderRight: "1px solid #fdba74",
    },
    ".cm-activeLine": {
      backgroundColor: "#fff7ed",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#ffedd5",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "#fff7ed",
      border: "1px solid #fb923c",
      color: "#9a3412",
    },
    ".cm-tooltip": {
      backgroundColor: "#ffffff",
      border: "1px solid #fdba74",
      color: "#3b1d0f",
    },
  },
  { dark: false },
);

const atriumHighlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.modifier], color: "#c2410c" },
  { tag: [tags.name, tags.deleted, tags.character, tags.propertyName], color: "#3b1d0f" },
  { tag: [tags.function(tags.variableName), tags.labelName], color: "#9a3412" },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: "#ea580c",
  },
  { tag: [tags.definition(tags.name), tags.separator], color: "#3b1d0f" },
  { tag: [tags.className], color: "#d97706" },
  {
    tag: [tags.number, tags.changed, tags.annotation, tags.self, tags.namespace],
    color: "#ea580c",
  },
  { tag: [tags.typeName], color: "#d97706" },
  { tag: [tags.operator, tags.operatorKeyword], color: "#c2410c" },
  { tag: [tags.tagName], color: "#b45309" },
  { tag: [tags.squareBracket], color: "#3b1d0f" },
  { tag: [tags.attributeName], color: "#9a3412" },
  { tag: [tags.regexp], color: "#4d7c0f" },
  { tag: [tags.escape, tags.special(tags.string)], color: "#be123c" },
  { tag: [tags.meta], color: "#fb923c" },
  { tag: [tags.comment], color: "#c2410c", fontStyle: "italic" },
  { tag: [tags.strong], fontWeight: "bold" },
  { tag: [tags.emphasis], fontStyle: "italic" },
  { tag: [tags.link], color: "#9a3412", textDecoration: "underline" },
  { tag: [tags.heading], fontWeight: "bold", color: "#ea580c" },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: "#ea580c" },
  { tag: [tags.processingInstruction, tags.string, tags.inserted], color: "#4d7c0f" },
  { tag: [tags.invalid], color: "#ffffff", backgroundColor: "#be123c" },
]);

const editorExtensions = {
  html: [
    basicSetup,
    atriumTheme,
    syntaxHighlighting(atriumHighlightStyle),
    html(),
    EditorView.lineWrapping,
  ],
  tsx: [
    basicSetup,
    atriumTheme,
    syntaxHighlighting(atriumHighlightStyle),
    javascript({ jsx: true, typescript: true }),
    EditorView.lineWrapping,
  ],
} as const;

const editorShadowStyles = `
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .editor-root {
    width: 100%;
    height: 100%;
  }

  .cm-editor {
    height: 100%;
  }

  .cm-scroller {
    overflow: auto;
    font-family: "SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  }
`;

export class SvCodeEditorElement extends HTMLElement {
  static observedAttributes = ["language"];

  private editorView: EditorView | null = null;
  private editorMount: HTMLDivElement;
  private currentLanguage: EditorLanguage = "html";
  private currentValue = "";

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = editorShadowStyles;
    this.editorMount = document.createElement("div");
    this.editorMount.className = "editor-root";
    shadowRoot.append(style, this.editorMount);
  }

  connectedCallback() {
    this.currentLanguage = this.readLanguage();
    this.ensureEditor();
  }

  disconnectedCallback() {
    this.editorView?.destroy();
    this.editorView = null;
  }

  attributeChangedCallback(name: string) {
    if (name !== "language") {
      return;
    }

    const nextLanguage = this.readLanguage();
    if (nextLanguage === this.currentLanguage) {
      return;
    }

    this.currentLanguage = nextLanguage;
    this.rebuildEditor();
  }

  get value() {
    return this.editorView?.state.doc.toString() ?? this.currentValue;
  }

  set value(value: string) {
    this.currentValue = value;
    if (!this.editorView || this.editorView.state.doc.toString() === value) {
      return;
    }

    this.editorView.dispatch({
      changes: {
        from: 0,
        to: this.editorView.state.doc.length,
        insert: value,
      },
    });
  }

  private readLanguage(): EditorLanguage {
    return this.getAttribute("language") === "tsx" ? "tsx" : "html";
  }

  private createState() {
    return EditorState.create({
      doc: this.currentValue,
      extensions: [
        ...editorExtensions[this.currentLanguage],
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) {
            return;
          }

          this.currentValue = update.state.doc.toString();
          this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        }),
      ],
    });
  }

  private ensureEditor() {
    if (this.editorView) {
      return;
    }

    this.editorView = new EditorView({
      parent: this.editorMount,
      root: this.shadowRoot ?? document,
      state: this.createState(),
    });
  }

  private rebuildEditor() {
    const previousValue = this.value;
    this.editorView?.destroy();
    this.editorView = null;
    this.currentValue = previousValue;
    this.ensureEditor();
  }
}

if (!customElements.get("sv-code-editor")) {
  customElements.define("sv-code-editor", SvCodeEditorElement);
}

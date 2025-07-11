import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import {
  $getRoot,
  $insertNodes,
  createEditor,
  ElementNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalUpdateJSON,
  type NodeKey,
  type SerializedLexicalNode,
} from "lexical";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { ListItemNode, ListNode } from "@lexical/list";
import { $generateNodesFromDOM } from "@lexical/html";

interface SerializedMyCustomNode extends SerializedLexicalNode {
  foo?: string;
}

class HTMLNode extends ElementNode {
  __html: string;

  static getType(): string {
    return "html-node";
  }

  static clone(node: HTMLNode): HTMLNode {
    // If any state needs to be set after construction, it should be
    // done by overriding the `afterCloneFrom` instance method.
    return new HTMLNode(node.__html, node.__key);
  }

  static importJSON(serializedNode: LexicalUpdateJSON<SerializedMyCustomNode>): HTMLNode {
    return new HTMLNode().updateFromJSON(serializedNode);
  }

  static importDOM() {
    return {
      div: (node: HTMLElement) => {
        if (node.hasAttribute("data-html-node")) {
          return {
            priority: 1,
            conversion: (node) => {
              return {
                node: new HTMLNode(node.innerHTML),
              };
            },
          };
        }
        return null;
      },
    };
  }

  constructor(foo: string = "", key?: NodeKey) {
    super(key);
    this.__html = foo;
  }

  updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedMyCustomNode>): this {
    const self = super.updateFromJSON(serializedNode);
    return typeof serializedNode.foo === "string"
      ? self.setFoo(serializedNode.foo)
      : self;
  }

  exportJSON() {
    const serializedNode: SerializedMyCustomNode = super.exportJSON();
    const foo = this.getFoo();
    if (foo !== "") {
      serializedNode.foo = foo;
    }
    return serializedNode;
  }

  updateDOM(prevNode: HTMLNode): boolean {
    return false;
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const ele = document.createElement("div");
    ele.innerHTML = this.getFoo();
    ele.className = "relative";
    return ele;
  }

  setFoo(foo: string): this {
    // getWritable() creates a clone of the node
    // if needed, to ensure we don't try and mutate
    // a stale version of this node.
    const self = this.getWritable();
    self.__html = foo;
    return self;
  }

  getFoo(): string {
    // getLatest() ensures we are getting the most
    // up-to-date value from the EditorState.
    const self = this.getLatest();
    return self.__html;
  }
}

class DocsEditorElement extends (globalThis.HTMLElement || class {}) {
  connectedCallback() {
    location.search.includes("editor") && this.initEditor();
  }

  initEditor() {
    const contentString = this.innerHTML;
    this.contentEditable = "true";
    this.classList.add("hydrated");

    const filePath = this.getAttribute("filepath");

    console.info(filePath, contentString);

    const editor = createEditor({
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, HTMLNode],
      onError: (error: Error) => {
        throw error;
      },
      theme: {},
    });

    editor.setRootElement(this);

    mergeRegister(
      registerRichText(editor),
      registerHistory(editor, createEmptyHistoryState(), 300),
    );

    editor.update(() => {
      // In the browser you can use the native DOMParser API to parse the HTML string.
      const parser = new DOMParser();
      const dom = parser.parseFromString(contentString, "text/html");

      // Once you have the DOM instance it's easy to generate LexicalNodes.
      const nodes = $generateNodesFromDOM(editor, dom);
      console.info(nodes);

      // Select the root
      $getRoot().select();
      // Insert them at a selection.
      $insertNodes(nodes);
    });

    editor.registerUpdateListener(({ editorState }) => {
      // Read the editorState and maybe get some value.
      editorState.read(() => {
        // Convert the editorState to Markdown.
        const markdown = $convertToMarkdownString([
          ...TRANSFORMERS,
          {
            type: "element",
            export(node) {
              if (node instanceof HTMLNode) {
                return "[html]";
              }
            },
          },
        ]);

        console.info(markdown);
        fetch(`/content?filepath=${filePath}`, { method: "POST", body: markdown });
      });
    });
  }
}

customElements.define("docs-editor", DocsEditorElement);

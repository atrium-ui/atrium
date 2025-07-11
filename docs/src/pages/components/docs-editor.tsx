import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { $getRoot, $insertNodes, createEditor, HISTORY_MERGE_TAG } from "lexical";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { ListItemNode, ListNode } from "@lexical/list";
import { $generateNodesFromDOM } from "@lexical/html";

class DocsEditorElement extends (globalThis.HTMLElement || class {}) {
  config = {
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: (error: Error) => {
      throw error;
    },
    theme: {
      quote: "PlaygroundEditorTheme__quote",
    },
  };

  connectedCallback() {
    const contentString = this.innerHTML;
    this.contentEditable = "true";

    const editor = createEditor(this.config);
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

      // Select the root
      $getRoot().select();
      // Insert them at a selection.
      $insertNodes(nodes);

      this.classList.add("hydrated");
    });

    editor.registerUpdateListener(({ editorState }) => {
      // Read the editorState and maybe get some value.
      editorState.read(() => {
        // Convert the editorState to Markdown.
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        console.log(markdown);
      });
    });
  }
}

customElements.define("docs-editor", DocsEditorElement);

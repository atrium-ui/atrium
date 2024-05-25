/* @jsxImportSource vue */
import { defineComponent, ref } from "vue";
import "@sv/elements/blur";
import { Button } from "./Button";
import { Icon } from "./Icon";

export const Lightbox = defineComponent((_, { slots }) => {
  const open = ref(false);

  return () => (
    <div>
      <Button
        onClick={() => {
          open.value = true;
        }}
      >
        Open
      </Button>

      {/* TODO: it may be better to implement portals with a framwork specific library */}
      <a-portal>
        <a-blur
          enabled={open.value || undefined}
          class={[
            "group/dialog absolute top-0 left-0 z-50 block h-screen w-screen opacity-0 transition-all",
            "[&[enabled]]:bg-[#33333333] [&[enabled]]:opacity-100 [&[enabled]]:backdrop-blur-md",
          ]}
          onBlur={() => {
            open.value = false;
          }}
        >
          <div
            class={[
              "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 min-w-[400px] transition-all",
              "scale-95 group-[&[enabled]]/dialog:block group-[&[enabled]]/dialog:scale-100",
            ]}
          >
            {slots.default?.()}
          </div>

          <div class="absolute top-20 right-20 z-50 text-2xl">
            <Button
              label="close"
              variant="ghost"
              onClick={() => {
                open.value = false;
              }}
            >
              <Icon name="close" />
            </Button>
          </div>
        </a-blur>
      </a-portal>
    </div>
  );
});

// This portal just moves all its children into an element at the top layer of the document
customElements.define(
  "a-portal",
  class extends (globalThis.HTMLElement || class {}) {
    // TODO: try to find existing portal with this.dataset.portal
    portal = this.createPortal();

    protected createPortal() {
      const ele = document.createElement("div");
      const id = crypto.randomUUID();
      ele.dataset.portal = id;
      ele.style.position = "fixed";
      ele.style.top = "0px";
      ele.style.left = "0px";
      ele.style.zIndex = "10000000";
      return ele;
    }

    disconnectedCallback(): void {
      this.portal.remove();
    }

    connectedCallback(): void {
      const observer = new MutationObserver(() => {
        if (this.children.length) {
          requestAnimationFrame(() => {
            this.portal.innerHTML = "";
            this.portal.append(...this.children);
          });
        }
      });

      observer.observe(this, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
      });

      document.body.append(this.portal);

      this.dataset.portal = this.portal.dataset.portal;
    }
  },
);

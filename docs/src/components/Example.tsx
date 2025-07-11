import { twMerge } from "tailwind-merge";
import "@sv/svg-sprites/svg-icon";
import { elementToSVG } from "dom-to-svg";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";

function copySVG(target: HTMLElement) {
  const svgDocument = elementToSVG(target);
  return new XMLSerializer().serializeToString(svgDocument);
}

export function ExamplePreview(props: PropsWithChildren) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("hydrated");
  }, []);

  const blurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    blurRef.current?.addEventListener("exit", () => {
      setOpen(false);
    });
    return () => {
      blurRef.current?.removeEventListener("exit", () => {
        setOpen(false);
      });
    };
  }, []);

  return (
    <div>
      <div className="absolute bottom-0 left-full">
        <div className="flex flex-col gap-module-xl px-[1.75rem] py-2">
          <button
            type="button"
            className="button-icon"
            onClick={(e) => {
              const ele = e.target?.closest(".relative")?.querySelector(".not-content");
              const str = copySVG(ele);

              navigator.clipboard
                .write([new ClipboardItem({ "text/plain": str || "" })])
                .then(() => {
                  showToast("Copied to clipboard");
                });
            }}
          >
            <svg-icon className="block" use="svg" />
          </button>

          <button
            type="button"
            className="button-icon"
            onClick={() => {
              setOpen(!open);
            }}
          >
            <svg-icon className="block" use="code" />
          </button>
        </div>
      </div>

      <a-blur
        enabled={open || undefined}
        ref={blurRef}
        className={twMerge(
          "-right-[10px] absolute top-0 z-10 my-4 max-h-full w-full max-w-[70%] overflow-auto rounded-lg bg-white opacity-0 shadow-xl [&[enabled]]:opacity-100",
          "after:fixed after:top-0 after:left-0 after:h-full after:w-full",
        )}
      >
        <div className="relative z-10 overflow-clip rounded-lg bg-[#24292F] text-white">
          <div className="sticky top-0 bg-[#3A3A43] p-2">Code view</div>
          {/* contenteditable scopes ctrl+a to this box */}
          <div contentEditable>{props.children}</div>
        </div>
      </a-blur>
    </div>
  );
}

import { twMerge } from "tailwind-merge";
import "@sv/svg-sprites/svg-icon";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";

export function ExampleCodeView(props: PropsWithChildren & { external?: stirng }) {
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
      <a-blur
        enabled={open || undefined}
        ref={blurRef}
        className={twMerge(
          "-right-[10px] absolute top-0 z-10 my-4 flex max-h-full min-h-[200px] w-full max-w-[70%] overflow-auto rounded-lg bg-white opacity-0 shadow-xl [&[enabled]]:opacity-100",
          "after:fixed after:top-0 after:left-0 after:h-full after:w-full",
        )}
      >
        <div className="relative z-10 w-full rounded-lg bg-[#24292F] text-white">
          <div className="sticky top-0 bg-[#3A3A43] p-2">Code view</div>
          {/* contenteditable scopes ctrl+a to this box */}
          <div contentEditable>{props.children}</div>
        </div>
      </a-blur>
    </div>
  );
}

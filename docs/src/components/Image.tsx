/* @jsxImportSource vue */

import { Lightbox } from "@components/src/vue";
import { twMerge } from "tailwind-merge";

const images = {
  1: {
    default: "/placeholder.svg",
  },
};

export function randomImage() {
  const keys = Object.keys(images);
  const uid = Math.floor(Math.random() * keys.length);
  const src = images[keys[uid] || 0];
  return src?.default;
}

export function Image(props: {
  src?: string;
  class?: string;
  width?: number;
  height?: number;
  lightbox?: boolean;
}) {
  const src = props.src || randomImage();

  if (props.lightbox) {
    return (
      <>
        <Lightbox>
          {{
            trigger: () => (
              <img
                class={twMerge("bg-white object-contain", props.class)}
                src={src}
                alt={src}
                width={props.width}
                height={props.height}
                loading="lazy"
              />
            ),
            default: () => (
              <a-pinch-zoom min-scale="0.5">
                <img
                  class={twMerge(
                    "max-h-[70vh] max-w-[70vw] bg-white object-contain",
                    props.class,
                  )}
                  src={src}
                  alt={src}
                  loading="lazy"
                />
              </a-pinch-zoom>
            ),
          }}
        </Lightbox>
      </>
    );
  }

  return (
    <img
      class={twMerge("bg-white object-contain", props.class)}
      src={src}
      alt={src}
      width={props.width}
      height={props.height}
      loading="lazy"
    />
  );
}

/* @jsxImportSource vue */

const landscape = import.meta.glob("../../assets/images/landscape/*.webp", {
  eager: true,
  as: "url",
});

const portrait = import.meta.glob("../../assets/images/portrait/*.webp", {
  eager: true,
  as: "url",
});

const images = Object.assign(landscape, portrait);

export function randomImage() {
  const keys = Object.keys(images);
  const uid = Math.floor(Math.random() * keys.length);
  const src = images[keys[uid] || 0];

  return src;
}

export function Image() {
  const src = randomImage();

  return (
    <img
      class="h-full w-full bg-white object-contain p-2"
      src={src}
      alt={src}
      loading="lazy"
      decoding="async"
    />
  );
}

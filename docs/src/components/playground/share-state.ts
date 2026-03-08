import type { PlaygroundFiles } from "@sv/playground";

type SharedPlaygroundState = {
  h: string;
  t: string;
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).split("+").join("-").split("/").join("_").split("=").join("");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value
    .split("-")
    .join("+")
    .split("_")
    .join("/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export async function encodeSharedPlaygroundFiles(
  files: PlaygroundFiles,
): Promise<string> {
  const payload: SharedPlaygroundState = {
    h: files["index.html"] ?? "",
    t: files["index.tsx"] ?? "",
  };

  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export async function decodeSharedPlaygroundFiles(
  encoded: string,
): Promise<PlaygroundFiles> {
  const payload = JSON.parse(
    new TextDecoder().decode(base64UrlToBytes(encoded)),
  ) as Partial<SharedPlaygroundState>;

  if (typeof payload.h !== "string" || typeof payload.t !== "string") {
    throw new Error("Invalid playground share payload.");
  }

  return {
    "index.html": payload.h,
    "index.tsx": payload.t,
  };
}

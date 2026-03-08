import type { PlaygroundFiles } from "@sv/playground";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

type SharedPlaygroundState = {
  h: string;
  t: string;
};

type SharedEnvelope =
  | {
      v: 1;
      c: "plain";
      d: string;
    }
  | {
      v: 1;
      c: "gzip" | "lz";
      d: string;
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
  const payload = JSON.stringify({
    h: files["index.html"] ?? "",
    t: files["index.tsx"] ?? "",
  } satisfies SharedPlaygroundState);

  const envelope: SharedEnvelope = {
    v: 1,
    c: "lz",
    d: compressToEncodedURIComponent(payload),
  };

  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(envelope)));
}

export async function decodeSharedPlaygroundFiles(
  encoded: string,
): Promise<PlaygroundFiles> {
  const decoded = new TextDecoder().decode(base64UrlToBytes(encoded));

  let payloadText = decoded;

  try {
    const envelope = JSON.parse(decoded) as Partial<SharedEnvelope>;
    if (envelope.v === 1 && envelope.c === "plain" && typeof envelope.d === "string") {
      payloadText = new TextDecoder().decode(base64UrlToBytes(envelope.d));
    } else if (
      envelope.v === 1 &&
      envelope.c === "lz" &&
      typeof envelope.d === "string"
    ) {
      const decompressed = decompressFromEncodedURIComponent(envelope.d);
      if (!decompressed) {
        throw new Error("Invalid compressed playground share payload.");
      }
      payloadText = decompressed;
    } else if (
      envelope.v === 1 &&
      envelope.c === "gzip" &&
      typeof envelope.d === "string"
    ) {
      throw new Error("Legacy gzip share links are no longer supported.");
    }
  } catch {
    payloadText = decoded;
  }

  const payload = JSON.parse(payloadText) as Partial<SharedPlaygroundState>;

  if (typeof payload.h !== "string" || typeof payload.t !== "string") {
    throw new Error("Invalid playground share payload.");
  }

  return {
    "index.html": payload.h,
    "index.tsx": payload.t,
  };
}

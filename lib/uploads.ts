export type UploadKind = "cv" | "image" | "certificate" | "project-document";

export const uploadRules: Record<UploadKind, { mimeTypes: string[]; maxBytes: number }> = {
  cv: { mimeTypes: ["application/pdf"], maxBytes: 10 * 1024 * 1024 },
  image: { mimeTypes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  certificate: { mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"], maxBytes: 10 * 1024 * 1024 },
  "project-document": { mimeTypes: ["application/pdf"], maxBytes: 10 * 1024 * 1024 },
};

export function hasValidFileSignature(mimeType: string, bytes: Uint8Array) {
  if (mimeType === "application/pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (mimeType === "image/png") return bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/webp") return bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}

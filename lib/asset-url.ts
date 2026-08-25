const assetFilenamePattern = /^[a-z0-9][a-z0-9._-]*\.(?:pdf|jpg|jpeg|png|webp)$/i;

export function isLocalAssetUrl(value: unknown) {
  return typeof value === "string" && /^\/uploads\/([a-z0-9][a-z0-9._-]*\.(?:pdf|jpg|jpeg|png|webp))$/i.test(value);
}

export function isControlledAssetUrl(value: unknown) {
  return typeof value === "string" && /^\/media\/([a-z0-9][a-z0-9._-]*\.(?:pdf|jpg|jpeg|png|webp))$/i.test(value);
}

export function isBlobAssetUrl(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.search === "" &&
      url.hash === "" &&
      /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(url.hostname) &&
      /^\/uploads\/[a-z0-9][a-z0-9._-]*\.(?:pdf|jpg|jpeg|png|webp)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function isAssetUrl(value: unknown, allowEmpty = true) {
  if (value === "" && allowEmpty) return true;
  if (typeof value !== "string" || value.length > 500) return false;
  return isLocalAssetUrl(value) || isControlledAssetUrl(value) || isBlobAssetUrl(value);
}

export function isPdfAssetUrl(value: unknown) {
  if (isLocalAssetUrl(value) || isControlledAssetUrl(value)) return /\.pdf$/i.test(String(value));
  if (isBlobAssetUrl(value)) {
    try {
      return /\.pdf$/i.test(new URL(String(value)).pathname);
    } catch {
      return false;
    }
  }
  return false;
}

export function isAssetFilename(value: string) {
  return assetFilenamePattern.test(value);
}

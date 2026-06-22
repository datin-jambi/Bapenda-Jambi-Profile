export default function imagekitLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Local public assets — any absolute path that is NOT an external URL
  if (src.startsWith("/") && !src.startsWith("//")) {
    return src;
  }

  // Absolute ImageKit URL — append transform params
  if (src.startsWith("https://ik.imagekit.io")) {
    const url = new URL(src);
    url.searchParams.set("tr", `w-${width},q-${quality ?? 75}`);
    return url.toString();
  }

  // Relative path — prepend the ImageKit endpoint
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${endpoint}${path}?tr=w-${width},q-${quality ?? 75}`;
}

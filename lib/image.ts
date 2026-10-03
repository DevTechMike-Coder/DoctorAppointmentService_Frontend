const AVATAR_SIZE = 512;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/**
 * Center-crops an image file to a square and downsizes it to a 512×512 JPEG in the
 * browser, so uploads are ~30–80 KB instead of multi-MB camera photos. The backend
 * still validates and re-encodes everything; this is a bandwidth/UX optimization,
 * not a security boundary.
 */
export async function resizeToAvatar(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file (JPG or PNG).");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("That image is too large. Choose one under 15 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    // "from-image" applies the EXIF rotation so phone photos aren't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Couldn't read that image. Try a JPG or PNG.");
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const target = Math.min(side, AVATAR_SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Your browser couldn't process that image.");
  }
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff"; // flatten PNG transparency
  ctx.fillRect(0, 0, target, target);
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    target,
    target,
  );
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("Couldn't process that image.");
  return blob;
}

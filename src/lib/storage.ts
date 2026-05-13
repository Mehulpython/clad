// ─── Storage Abstraction Layer ───────────────────────────────
// Saves images to public/uploads/ with UUID filenames.
// Swap this implementation for R2/S3/Cloudflare Images later
// without touching any calling code.

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

// ─── Config ──────────────────────────────────────────────────

/** Directory where uploaded images are stored (relative to project root). */
const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads"
);

/** Public URL prefix — matches the static file serving from public/uploads/. */
const PUBLIC_URL_PREFIX = "/uploads";

// Allowed image types and their file extensions
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

// ─── Ensure directory exists ─────────────────────────────────

async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Upload an image file or buffer to local storage.
 *
 * @param file   - A web File object or a Node Buffer.
 * @param prefix - Optional sub-directory prefix (e.g. "wardrobe", "scan").
 * @returns The publicly-accessible URL of the stored image.
 */
export async function uploadImage(
  file: File | Buffer,
  prefix: string = "wardrobe"
): Promise<string> {
  await ensureUploadDir();

  // Determine mime type & extension
  let mimeType: string;
  let buffer: Buffer;

  if (file instanceof File) {
    mimeType = file.type || "image/jpeg";
    const ab = await file.arrayBuffer();
    buffer = Buffer.from(ab);
  } else {
    // Raw Buffer — assume JPEG if no metadata available
    mimeType = "image/jpeg";
    buffer = file;
  }

  const ext = MIME_EXTENSIONS[mimeType] || ".jpg";
  const uuid = randomUUID();
  const timestamp = Date.now();
  const filename = `${prefix}-${uuid}-${timestamp}${ext}`;

  // Write to disk
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, buffer);

  return `${PUBLIC_URL_PREFIX}/${filename}`;
}

/**
 * Delete an image by its public URL.
 * Silently succeeds if the file doesn't exist.
 *
 * @param url - The URL returned by `uploadImage()`.
 */
export async function deleteImage(url: string): Promise<void> {
  if (!url.startsWith(PUBLIC_URL_PREFIX + "/")) return; // not our URL

  const filename = url.slice(PUBLIC_URL_PREFIX.length + 1);
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.unlink(filePath);
  } catch (err) {
    // ENOENT is fine — file already gone
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Storage delete error:", err);
    }
  }
}

/**
 * Resolve a stored image path to its full public URL.
 * For local storage this is a passthrough, but R2/S3
 * implementations may need to sign URLs or use CDNs.
 */
export function getImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return `${PUBLIC_URL_PREFIX}/${path}`;
}

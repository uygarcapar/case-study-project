"use client";

import { createSupabaseBrowserClient } from "./client";

const BUCKET = "product-images";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export type UploadResult = { url: string; path: string };

export async function uploadProductImage(file: File): Promise<UploadResult> {
  const supabase = createSupabaseBrowserClient();
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/**
 * Extract storage path from a public URL.
 * Returns null if URL does not point to our bucket (e.g. external Unsplash URL).
 */
export function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function deleteProductImage(url: string | null): Promise<void> {
  const path = extractStoragePath(url);
  if (!path) return;
  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

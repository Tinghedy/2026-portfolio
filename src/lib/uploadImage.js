import imageCompression from "browser-image-compression";
import { supabase, STORAGE_BUCKET } from "./supabase";

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export async function uploadImage(file, folder = "") {
  const compressed = await imageCompression(file, compressionOptions);
  const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
  const filename = `${folder}${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, compressed, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteImageByUrl(url) {
  if (!url) return;
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) console.error("Storage delete error:", error.message);
}

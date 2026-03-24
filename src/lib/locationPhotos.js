import { supabase } from './supabase';

export const LOCATION_PHOTO_BUCKET = 'location-biens';

const MAX_LOCAL_BYTES = 2 * 1024 * 1024;

export function normalizePhotos(item) {
  if (!item) return [];
  const p = item.photos;
  if (Array.isArray(p)) return p.filter(Boolean);
  return [];
}

export async function uploadLocationPhotoToStorage(file) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage
    .from(LOCATION_PHOTO_BUCKET)
    .upload(safeName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });
  if (error) throw error;
  const { data } = supabase.storage.from(LOCATION_PHOTO_BUCKET).getPublicUrl(safeName);
  return data.publicUrl;
}

export function fileToDataUrlLimited(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_LOCAL_BYTES) {
      reject(new Error(`Image trop lourde (max. ${MAX_LOCAL_BYTES / 1024 / 1024} Mo en mode local).`));
      return;
    }
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    r.readAsDataURL(file);
  });
}

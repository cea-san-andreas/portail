import { supabase } from './supabase';

export const AFFICHES_BUCKET = 'affiches';

const MAX_BYTES = 12 * 1024 * 1024; /* 12 Mo */

/**
 * Envoie une image locale vers le bucket Supabase et renvoie l’URL publique.
 */
export async function uploadAfficheImage(file) {
  if (!file?.type?.startsWith('image/')) {
    return { error: 'Choisis un fichier image (PNG, JPG, WebP, GIF…).' };
  }
  if (file.size > MAX_BYTES) {
    return { error: 'Image trop lourde (max. 12 Mo).' };
  }
  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const safeName = `affiche-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error } = await supabase.storage.from(AFFICHES_BUCKET).upload(safeName, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/png',
  });

  if (error) {
    return {
      error:
        error.message?.includes('Bucket not found') || error.message?.includes('not found')
          ? 'Bucket Storage « affiches » introuvable. Exécute supabase-storage-affiches.sql dans Supabase.'
          : error.message || 'Échec de l’envoi de l’image.',
    };
  }

  const { data } = supabase.storage.from(AFFICHES_BUCKET).getPublicUrl(safeName);
  return { publicUrl: data.publicUrl };
}

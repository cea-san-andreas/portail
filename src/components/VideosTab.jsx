import { useRef, useState } from 'react';
import { Video, Plus, Trash2, Save, X, ExternalLink, Play, Upload, Smartphone, Monitor, Loader } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';

const emptyForm = { titre: '', url: '', description: '', categorie: 'Général' };
const CATEGORIES = ['Général', 'Communication', 'Événementiel', 'Formation', 'Autres'];
const columnMap = { titre: 'titre', url: 'url', description: 'description', categorie: 'categorie', dateAjout: 'date_ajout' };
const BUCKET = 'videos-upload';

function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return null;
}

function getThumbnail(url) {
  const ytMatch = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
  return null;
}

function isDirectVideo(url) {
  if (!url) return false;
  return url.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i) || url.includes('supabase') && url.includes('videos-upload');
}

export default function VideosTab() {
  const { items, add, remove } = useSupabaseData('videos', [], { columnMap });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [playingId, setPlayingId] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef(null);
  const captureInputRef = useRef(null);

  const playingVideo = items.find(v => v.id === playingId);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const save = () => {
    if (!form.titre?.trim() || !form.url?.trim()) return;
    add({ ...form, dateAjout: new Date().toLocaleDateString('fr-FR') });
    setForm(emptyForm);
    setShowForm(false);
    setUploadMsg('');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (50 MB max for Supabase free tier)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadMsg(`Erreur: Le fichier fait ${(file.size / (1024 * 1024)).toFixed(1)} Mo. La limite est de 50 Mo.`);
      setShowForm(true);
      event.target.value = '';
      return;
    }

    setUploading(true);
    setUploadMsg('');
    setShowForm(true);

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type || 'video/mp4',
        upsert: false,
      });

      if (uploadError) {
        setUploadMsg(`Erreur upload: ${uploadError.message}`);
        return;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

      setForm(prev => ({
        ...prev,
        url: urlData.publicUrl,
        titre: prev.titre || file.name.replace(/\.[^.]+$/, ''),
      }));
      setUploadMsg('Vidéo uploadée avec succès !');
    } catch (err) {
      setUploadMsg(`Erreur: ${err.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (video) => {
    if (!window.confirm(`Supprimer « ${video.titre} » ?`)) return;

    // If the video was uploaded to our bucket, delete from storage too
    if (video.url?.includes('videos-upload/')) {
      const fileName = video.url.split('videos-upload/').pop()?.split('?')[0];
      if (fileName) {
        await supabase.storage.from(BUCKET).remove([fileName]);
      }
    }
    remove(video.id);
  };

  const filtered = filterCat ? items.filter(v => v.categorie === filterCat) : items;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
            <Video className="w-6 h-6 text-copper" /> Vidéos
          </h2>
          <p className="text-sm text-text-muted mt-1">{items.length} vidéo{items.length > 1 ? 's' : ''} enregistrée{items.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border text-sm bg-surface cursor-pointer">
            <option value="">Toutes catégories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Upload depuis PC */}
          <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all cursor-pointer shadow-md hover:-translate-y-0.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Monitor className="w-4 h-4" /> Depuis le PC
          </label>

          {/* Upload depuis téléphone (caméra) */}
          <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 transition-all cursor-pointer shadow-md hover:-translate-y-0.5">
            <input
              ref={captureInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Smartphone className="w-4 h-4" /> Filmer
          </label>

          {/* Ajouter par lien */}
          <button onClick={() => { setShowForm(!showForm); setUploadMsg(''); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Ajouter par lien
          </button>
        </div>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 animate-slide-up">
          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          <p className="text-sm text-blue-700 font-medium">Upload de la vidéo en cours... Cela peut prendre un moment selon la taille du fichier.</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-copper" /> {form.url && isDirectVideo(form.url) ? 'Vidéo uploadée — complète les infos' : 'Nouvelle vidéo (par lien)'}
          </h3>

          {uploadMsg && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${uploadMsg.includes('Erreur') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {uploadMsg}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Titre *</label>
              <input type="text" value={form.titre} onChange={e => set('titre', e.target.value)} placeholder="Titre de la vidéo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">URL de la vidéo *</label>
              <input type="url" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://youtube.com/watch?v=... ou uploadée automatiquement"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" readOnly={!!isDirectVideo(form.url)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Catégorie</label>
              <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer transition-colors">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Description</label>
              <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description courte..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
          </div>

          {/* Preview of uploaded video */}
          {form.url && isDirectVideo(form.url) && (
            <div className="mt-4 p-3 bg-surface rounded-xl border border-border">
              <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">Aperçu</p>
              <video src={form.url} controls className="w-full max-h-48 rounded-lg bg-black" />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={uploading} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md disabled:opacity-50">
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setUploadMsg(''); }} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer">
              <X className="w-4 h-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Video player */}
      {playingVideo && (getEmbedUrl(playingVideo.url) || isDirectVideo(playingVideo.url)) && (
        <div className="bg-card rounded-2xl border border-copper/30 overflow-hidden shadow-xl animate-slide-up">
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-copper-light" /> {playingVideo.titre}
            </h3>
            <button onClick={() => setPlayingId(null)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          {isDirectVideo(playingVideo.url) ? (
            <video src={playingVideo.url} controls autoPlay className="w-full" style={{ maxHeight: '500px' }} />
          ) : (
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={getEmbedUrl(playingVideo.url)}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={playingVideo.titre}
              />
            </div>
          )}
        </div>
      )}

      {/* Videos grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((video) => {
          const thumb = getThumbnail(video.url);
          const isDirect = isDirectVideo(video.url);
          return (
            <div key={video.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="relative h-44 bg-primary-light cursor-pointer group" onClick={() => setPlayingId(video.id)}>
                {thumb ? (
                  <img src={thumb} alt={video.titre} className="w-full h-full object-cover" />
                ) : isDirect ? (
                  <video src={video.url} className="w-full h-full object-cover" muted preload="metadata" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-7 h-7 text-primary ml-1" />
                  </div>
                </div>
                {isDirect && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-green-500/90 text-white text-[10px] font-bold flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Uploadée
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-extrabold text-primary line-clamp-2">{video.titre}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-copper whitespace-nowrap">{video.categorie}</span>
                </div>
                {video.description && <p className="text-xs text-text-muted mb-2 line-clamp-2">{video.description}</p>}
                <p className="text-[10px] text-text-light">Ajoutée le {video.dateAjout}</p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                  {!isDirect && (
                    <a href={video.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all">
                      <ExternalLink className="w-3 h-3" /> Ouvrir
                    </a>
                  )}
                  <button onClick={() => handleDelete(video)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-danger/20 text-danger hover:bg-red-50 transition-all cursor-pointer">
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <Video className="w-10 h-10 text-text-light mx-auto mb-3" />
          <p className="text-text-muted font-semibold">Aucune vidéo enregistrée</p>
          <p className="text-text-light text-sm mt-1">Uploade une vidéo depuis ton PC / téléphone ou ajoute un lien YouTube.</p>
        </div>
      )}
    </div>
  );
}

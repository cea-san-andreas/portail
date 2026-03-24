import { useRef, useState, useCallback } from 'react';
import { Video, Plus, Trash2, Save, X, ExternalLink, Play, Upload, Smartphone, Monitor, Loader, Film, Link } from 'lucide-react';
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
  return url.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i) || (url.includes('supabase') && url.includes('videos-upload'));
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}

export default function VideosTab() {
  const { items, add, remove } = useSupabaseData('videos', [], { columnMap });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('upload'); // 'upload' | 'link'
  const [form, setForm] = useState(emptyForm);
  const [playingId, setPlayingId] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
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
    setUploadProgress('');
  };

  const processFile = useCallback(async (file) => {
    if (!file) return;

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadMsg(`Le fichier fait ${formatSize(file.size)}. La limite est de 50 Mo.`);
      return;
    }

    setUploading(true);
    setUploadMsg('');
    setUploadProgress(`Upload de "${file.name}" (${formatSize(file.size)})...`);
    setShowForm(true);
    setFormMode('upload');

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type || 'video/mp4',
        upsert: false,
      });

      if (uploadError) {
        setUploadMsg(`Erreur: ${uploadError.message}`);
        setUploadProgress('');
        return;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

      setForm(prev => ({
        ...prev,
        url: urlData.publicUrl,
        titre: prev.titre || file.name.replace(/\.[^.]+$/, ''),
      }));
      setUploadMsg('success');
      setUploadProgress('');
    } catch (err) {
      setUploadMsg(`Erreur: ${err.message}`);
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileUpload = async (event) => {
    await processFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      processFile(file);
    } else {
      setUploadMsg('Ce fichier n\'est pas une vidéo.');
      setShowForm(true);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDelete = async (video) => {
    if (!window.confirm(`Supprimer « ${video.titre} » ?`)) return;
    if (video.url?.includes('videos-upload/')) {
      const fileName = video.url.split('videos-upload/').pop()?.split('?')[0];
      if (fileName) {
        await supabase.storage.from(BUCKET).remove([fileName]);
      }
    }
    remove(video.id);
  };

  const openForm = (mode) => {
    setFormMode(mode);
    setShowForm(true);
    setUploadMsg('');
    setForm(emptyForm);
  };

  const filtered = filterCat ? items.filter(v => v.categorie === filterCat) : items;

  return (
    <div className="space-y-6 animate-fade-in"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-50 bg-primary-dark/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-card border-2 border-dashed border-copper rounded-3xl p-16 text-center">
            <Upload className="w-16 h-16 text-copper mx-auto mb-4 animate-bounce" />
            <p className="text-2xl font-extrabold text-primary">Dépose ta vidéo ici</p>
            <p className="text-text-muted mt-2">Formats acceptés : MP4, WebM, MOV...</p>
          </div>
        </div>
      )}

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
        </div>
      </div>

      {/* Upload zone — always visible when no form */}
      {!showForm && (
        <div className="bg-card border-2 border-dashed border-border hover:border-copper/50 rounded-2xl p-8 transition-all duration-300">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-copper/20 to-gold-light/20 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-copper" />
            </div>
            <p className="text-base font-bold text-primary">Ajouter une vidéo</p>
            <p className="text-sm text-text-muted mt-1">Glisse-dépose un fichier ou choisis une option ci-dessous</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Depuis le PC */}
            <label className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-primary-light to-primary text-white hover:shadow-lg hover:shadow-primary-light/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
              <Monitor className="w-4.5 h-4.5" /> Depuis le PC
            </label>

            {/* Filmer */}
            <label className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-success to-success-light text-white hover:shadow-lg hover:shadow-success/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <input ref={captureInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={handleFileUpload} />
              <Smartphone className="w-4.5 h-4.5" /> Filmer
            </label>

            {/* Lien YouTube */}
            <button onClick={() => openForm('link')}
              className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:shadow-lg hover:shadow-copper/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <Link className="w-4.5 h-4.5" /> Lien YouTube
            </button>
          </div>
        </div>
      )}

      {/* Upload progress bar */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-600/20 rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-600">Upload en cours</p>
              <p className="text-xs text-blue-600/70">{uploadProgress}</p>
            </div>
          </div>
          <div className="h-2 bg-blue-600/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl overflow-hidden shadow-lg animate-slide-up">
          {/* Form header */}
          <div className="px-6 py-4 bg-gradient-to-r from-copper/10 to-gold-light/5 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              {formMode === 'upload' ? (
                <><Upload className="w-5 h-5 text-copper" /> {uploadMsg === 'success' ? 'Vidéo uploadée — complète les infos' : 'Upload de vidéo'}</>
              ) : (
                <><Link className="w-5 h-5 text-copper" /> Ajouter un lien vidéo</>
              )}
            </h3>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setUploadMsg(''); setUploadProgress(''); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-alt hover:text-primary transition-all cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Messages */}
            {uploadMsg && uploadMsg !== 'success' && (
              <div className="p-3.5 rounded-xl text-sm font-medium bg-red-50 text-danger border border-danger/20 flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" /> {uploadMsg}
              </div>
            )}
            {uploadMsg === 'success' && (
              <div className="p-3.5 rounded-xl text-sm font-medium bg-green-50 text-success border border-success/20 flex items-center gap-2">
                <Save className="w-4 h-4 shrink-0" /> Vidéo uploadée avec succès ! Remplis le titre et clique Enregistrer.
              </div>
            )}

            {/* Preview of uploaded video */}
            {form.url && isDirectVideo(form.url) && (
              <div className="rounded-xl overflow-hidden border border-border bg-black">
                <video src={form.url} controls className="w-full max-h-56" />
              </div>
            )}

            {/* Upload buttons in form mode */}
            {formMode === 'upload' && !form.url && !uploading && (
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-primary-light to-primary text-white cursor-pointer hover:shadow-lg transition-all">
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                  <Monitor className="w-4 h-4" /> Choisir un fichier
                </label>
                <label className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-success to-success-light text-white cursor-pointer hover:shadow-lg transition-all">
                  <input type="file" accept="video/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                  <Smartphone className="w-4 h-4" /> Filmer depuis le téléphone
                </label>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Titre *</label>
                <input type="text" value={form.titre} onChange={e => set('titre', e.target.value)} placeholder="Titre de la vidéo"
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface hover:border-copper/40 focus:border-copper focus:ring-1 focus:ring-copper/20 transition-all outline-none" />
              </div>
              {formMode === 'link' ? (
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">URL YouTube *</label>
                  <input type="url" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface hover:border-copper/40 focus:border-copper focus:ring-1 focus:ring-copper/20 transition-all outline-none" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Fichier</label>
                  <input type="text" value={form.url ? 'Fichier uploadé' : 'En attente...'} readOnly
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface-alt text-text-muted cursor-not-allowed" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Catégorie</label>
                <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface cursor-pointer hover:border-copper/40 transition-all outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Description</label>
                <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description courte..."
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface hover:border-copper/40 focus:border-copper focus:ring-1 focus:ring-copper/20 transition-all outline-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={uploading || !form.url || !form.titre}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                <Save className="w-4 h-4" /> Enregistrer
              </button>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); setUploadMsg(''); setUploadProgress(''); }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-all cursor-pointer">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video player */}
      {playingVideo && (getEmbedUrl(playingVideo.url) || isDirectVideo(playingVideo.url)) && (
        <div className="bg-card rounded-2xl border border-copper/30 overflow-hidden shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#0f0f1a] to-[#1a1a2e]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-copper-light" /> {playingVideo.titre}
            </h3>
            <button onClick={() => setPlayingId(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          {isDirectVideo(playingVideo.url) ? (
            <video src={playingVideo.url} controls autoPlay className="w-full bg-black" style={{ maxHeight: '500px' }} />
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
      {filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((video) => {
            const thumb = getThumbnail(video.url);
            const isDirect = isDirectVideo(video.url);
            const isPlaying = playingId === video.id;
            return (
              <div key={video.id}
                className={`bg-card rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${isPlaying ? 'border-copper ring-2 ring-copper/20' : 'border-border'}`}>
                <div className="relative h-48 bg-gradient-to-br from-primary-light to-primary-dark cursor-pointer group" onClick={() => setPlayingId(video.id)}>
                  {thumb ? (
                    <img src={thumb} alt={video.titre} className="w-full h-full object-cover" />
                  ) : isDirect ? (
                    <video src={video.url} className="w-full h-full object-cover" muted preload="metadata" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary-dark">
                      <Film className="w-14 h-14 text-white/20" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                    <div className="w-14 h-14 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center shadow-none group-hover:shadow-xl transition-all duration-300 scale-75 group-hover:scale-100">
                      <Play className="w-7 h-7 text-primary ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    {isDirect && (
                      <span className="px-2.5 py-1 rounded-lg bg-success/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md backdrop-blur-sm">
                        <Upload className="w-3 h-3" /> Fichier
                      </span>
                    )}
                    {!isDirect && getEmbedUrl(video.url) && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md backdrop-blur-sm">
                        <Play className="w-3 h-3" /> YouTube
                      </span>
                    )}
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm">
                      {video.categorie}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-extrabold text-primary line-clamp-2 mb-1">{video.titre}</h3>
                  {video.description && <p className="text-xs text-text-muted mb-2 line-clamp-2">{video.description}</p>}
                  <p className="text-[10px] text-text-light mb-3">Ajoutée le {video.dateAjout}</p>
                  <div className="flex gap-2 pt-3 border-t border-border/40">
                    <button onClick={() => setPlayingId(video.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-copper/10 text-copper hover:bg-copper/20 transition-all cursor-pointer flex-1 justify-center">
                      <Play className="w-3.5 h-3.5" /> Lire
                    </button>
                    {!isDirect && (
                      <a href={video.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(video)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-danger/20 text-danger hover:bg-red-50 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !showForm && (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-copper/10 to-gold-light/10 flex items-center justify-center mx-auto mb-5">
            <Film className="w-10 h-10 text-copper/40" />
          </div>
          <p className="text-primary font-bold text-lg">Aucune vidéo enregistrée</p>
          <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">Upload une vidéo depuis ton PC, filme depuis ton téléphone ou ajoute un lien YouTube.</p>
        </div>
      )}
    </div>
  );
}

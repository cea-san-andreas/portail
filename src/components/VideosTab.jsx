import { useState } from 'react';
import { Video, Plus, Trash2, Save, X, ExternalLink, Play } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';

const emptyForm = { titre: '', url: '', description: '', categorie: 'Général' };
const CATEGORIES = ['Général', 'Communication', 'Événementiel', 'Formation', 'Autres'];
const columnMap = { titre: 'titre', url: 'url', description: 'description', categorie: 'categorie', dateAjout: 'date_ajout' };

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

export default function VideosTab() {
  const { items, add, remove } = useSupabaseData('videos', [], { columnMap });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [playingId, setPlayingId] = useState(null);
  const [filterCat, setFilterCat] = useState('');

  const playingVideo = items.find(v => v.id === playingId);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const save = () => {
    if (!form.titre?.trim() || !form.url?.trim()) return;
    add({ ...form, dateAjout: new Date().toLocaleDateString('fr-FR') });
    setForm(emptyForm);
    setShowForm(false);
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
        <div className="flex gap-2">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border text-sm bg-surface cursor-pointer">
            <option value="">Toutes catégories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Ajouter une vidéo
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-copper" /> Nouvelle vidéo
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Titre *</label>
              <input type="text" value={form.titre} onChange={e => set('titre', e.target.value)} placeholder="Titre de la vidéo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">URL de la vidéo *</label>
              <input type="url" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
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
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md">
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer">
              <X className="w-4 h-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Video player */}
      {playingVideo && getEmbedUrl(playingVideo.url) && (
        <div className="bg-card rounded-2xl border border-copper/30 overflow-hidden shadow-xl animate-slide-up">
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-copper-light" /> {playingVideo.titre}
            </h3>
            <button onClick={() => setPlayingId(null)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={getEmbedUrl(playingVideo.url)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={playingVideo.titre}
            />
          </div>
        </div>
      )}

      {/* Videos grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((video) => {
          const thumb = getThumbnail(video.url);
          return (
            <div key={video.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="relative h-44 bg-primary-light cursor-pointer group" onClick={() => setPlayingId(video.id)}>
                {thumb ? (
                  <img src={thumb} alt={video.titre} className="w-full h-full object-cover" />
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
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-extrabold text-primary line-clamp-2">{video.titre}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-copper whitespace-nowrap">{video.categorie}</span>
                </div>
                {video.description && <p className="text-xs text-text-muted mb-2 line-clamp-2">{video.description}</p>}
                <p className="text-[10px] text-text-light">Ajoutée le {video.dateAjout}</p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                  <a href={video.url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all">
                    <ExternalLink className="w-3 h-3" /> Ouvrir
                  </a>
                  <button onClick={() => { if (window.confirm(`Supprimer « ${video.titre} » ?`)) remove(video.id); }}
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
          <p className="text-text-light text-sm mt-1">Clique sur "Ajouter une vidéo" pour commencer.</p>
        </div>
      )}
    </div>
  );
}

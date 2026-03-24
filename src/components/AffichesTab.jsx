import { useState } from 'react';
import { Image, Plus, Trash2, Save, X, ExternalLink, Maximize2, Eye } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';

const emptyForm = { titre: '', imageUrl: '', description: '', evenement: '', auteur: '' };
const columnMap = { titre: 'titre', imageUrl: 'image_url', description: 'description', evenement: 'evenement', auteur: 'auteur', dateAjout: 'date_ajout' };

export default function AffichesTab() {
  const { items, add, remove } = useSupabaseData('affiches', [], { columnMap });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [previewId, setPreviewId] = useState(null);

  const previewItem = items.find(a => a.id === previewId);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const save = () => {
    if (!form.titre?.trim() || !form.imageUrl?.trim()) return;
    add({ ...form, dateAjout: new Date().toLocaleDateString('fr-FR') });
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
            <Image className="w-6 h-6 text-copper" /> Affiches
          </h2>
          <p className="text-sm text-text-muted mt-1">{items.length} affiche{items.length > 1 ? 's' : ''} enregistrée{items.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
          <Plus className="w-4 h-4" /> Ajouter une affiche
        </button>
      </div>

      {showForm && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-copper" /> Nouvelle affiche
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Titre *</label>
              <input type="text" value={form.titre} onChange={e => set('titre', e.target.value)} placeholder="Nom de l'affiche"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">URL de l'image *</label>
              <input type="url" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://i.imgur.com/... ou lien direct"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Événement lié</label>
              <input type="text" value={form.evenement} onChange={e => set('evenement', e.target.value)} placeholder="Nom de l'événement"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Auteur / Créateur</label>
              <input type="text" value={form.auteur} onChange={e => set('auteur', e.target.value)} placeholder="Qui a fait l'affiche"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Description</label>
              <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description courte..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
          </div>
          {form.imageUrl && (
            <div className="mt-4 p-3 bg-surface rounded-xl border border-border">
              <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">Aperçu</p>
              <img src={form.imageUrl} alt="Aperçu" className="max-h-48 rounded-lg object-contain" onError={e => e.target.style.display = 'none'} />
            </div>
          )}
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

      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewId(null)}>
          <div className="relative max-w-4xl max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewId(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors cursor-pointer">
              <X className="w-6 h-6" />
            </button>
            <img src={previewItem.imageUrl} alt={previewItem.titre} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
            <p className="text-center text-white/80 text-sm font-semibold mt-3">{previewItem.titre}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((affiche) => (
          <div key={affiche.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
            <div className="relative h-56 bg-primary-light cursor-pointer" onClick={() => setPreviewId(affiche.id)}>
              <img src={affiche.imageUrl} alt={affiche.titre} className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Maximize2 className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-extrabold text-primary line-clamp-2">{affiche.titre}</h3>
              {affiche.evenement && <p className="text-[11px] text-copper font-semibold mt-1">{affiche.evenement}</p>}
              {affiche.auteur && <p className="text-[10px] text-text-light mt-0.5">Par {affiche.auteur}</p>}
              {affiche.description && <p className="text-xs text-text-muted mt-1 line-clamp-2">{affiche.description}</p>}
              <p className="text-[10px] text-text-light mt-1">{affiche.dateAjout}</p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                <a href={affiche.imageUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all">
                  <ExternalLink className="w-3 h-3" /> Ouvrir
                </a>
                <button onClick={() => setPreviewId(affiche.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all cursor-pointer">
                  <Eye className="w-3 h-3" /> Voir
                </button>
                <button onClick={() => { if (window.confirm(`Supprimer « ${affiche.titre} » ?`)) remove(affiche.id); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-danger/20 text-danger hover:bg-red-50 transition-all cursor-pointer">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <Image className="w-10 h-10 text-text-light mx-auto mb-3" />
          <p className="text-text-muted font-semibold">Aucune affiche enregistrée</p>
          <p className="text-text-light text-sm mt-1">Clique sur "Ajouter une affiche" pour commencer.</p>
        </div>
      )}
    </div>
  );
}

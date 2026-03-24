import { useEffect, useRef, useState } from 'react';
import { X, FileText } from 'lucide-react';
import { CATEGORIES, TYPES, STATUSES } from '../data/seedDocuments';

const emptyForm = {
  title: '',
  category: 'Fondamentaux',
  type: 'Officiel',
  status: 'Actif',
  tags: '',
  link: '',
  contact: '',
  description: '',
  important: false,
};

export default function DocumentModal({ isOpen, onClose, onSave, editingDoc }) {
  const [form, setForm] = useState(emptyForm);
  const dialogRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (editingDoc) {
      setForm({
        title: editingDoc.title || '',
        category: editingDoc.category || 'Fondamentaux',
        type: editingDoc.type || 'Officiel',
        status: editingDoc.status || 'Actif',
        tags: (editingDoc.tags || []).join(', '),
        link: editingDoc.link || '',
        contact: editingDoc.contact || '',
        description: editingDoc.description || '',
        important: editingDoc.important || false,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingDoc, isOpen]);

  useEffect(() => {
    if (isOpen) titleRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.link.trim()) return;
    onSave(form);
    onClose();
  };

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-dark/70 backdrop-blur-md" onClick={onClose} />

      <div
        ref={dialogRef}
        className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-surface to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper to-gold-dark flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-primary">
              {editingDoc ? 'Modifier le document' : 'Nouveau document'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-alt transition-colors text-text-muted cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-muted mb-1.5">Titre *</label>
            <input
              ref={titleRef}
              type="text"
              required
              placeholder="Titre du document"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Catégorie', key: 'category', options: CATEGORIES },
              { label: 'Type', key: 'type', options: TYPES },
              { label: 'Statut', key: 'status', options: STATUSES },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-text-muted mb-1.5">{label}</label>
                <select
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt cursor-pointer transition-colors"
                >
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-text-muted mb-1.5">Lien du document *</label>
              <input
                type="url"
                required
                placeholder="https://docs.google.com/..."
                value={form.link}
                onChange={e => set('link', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-muted mb-1.5">Contact</label>
              <input
                type="tel"
                placeholder="555-0100"
                value={form.contact}
                onChange={e => set('contact', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-muted mb-1.5">Tags (virgules)</label>
            <input
              type="text"
              placeholder="procédure, guide, cea"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-muted mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Description du document..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all duration-200 resize-y"
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-copper/8 border border-copper/20 cursor-pointer hover:bg-copper/12 transition-colors">
            <input
              type="checkbox"
              checked={form.important}
              onChange={e => set('important', e.target.checked)}
              className="w-4 h-4 rounded border-border accent-gold cursor-pointer"
            />
            <span className="text-sm font-medium text-primary">Marquer comme document important (visible dans le Mémo)</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-all duration-200 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all duration-200 cursor-pointer shadow-lg shadow-copper/20 hover:shadow-copper/35 hover:-translate-y-0.5"
            >
              {editingDoc ? 'Enregistrer' : 'Créer le document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

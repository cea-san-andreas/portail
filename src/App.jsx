import { useCallback, useState } from 'react';
import WelcomePage from './components/WelcomePage';
import {
  FileText, FolderOpen, ShieldCheck, Layers, Users,
  Video, DollarSign, CalendarDays, Lightbulb, Image, Database, MapPin,
} from 'lucide-react';
import { useDocuments } from './hooks/useDocuments';
import Header from './components/Header';
import StatCard from './components/StatCard';
import SearchFilters from './components/SearchFilters';
import DocumentList from './components/DocumentList';
import DocumentModal from './components/DocumentModal';
import GuideTab from './components/GuideTab';
import MemoSection from './components/MemoSection';
import GuidePage from './components/GuidePage';
import AssociationsTab from './components/AssociationsTab';
import VideosTab from './components/VideosTab';
import ComptabiliteTab from './components/ComptabiliteTab';
import EvenementsTab from './components/EvenementsTab';
import IdeesTab from './components/IdeesTab';
import AffichesTab from './components/AffichesTab';
import StockageTab from './components/StockageTab';
import LocationTab from './components/LocationTab';

const TABS = [
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'memo', label: 'Mémo', icon: ShieldCheck },
  { key: 'procedures', label: 'Procédures CEA', icon: FolderOpen },
  { key: 'associations', label: 'Associations', icon: Users },
  { key: 'evenements', label: 'Événements', icon: CalendarDays },
  { key: 'videos', label: 'Vidéos', icon: Video },
  { key: 'comptabilite', label: 'Comptabilité', icon: DollarSign },
  { key: 'idees', label: 'Idées', icon: Lightbulb },
  { key: 'affiches', label: 'Affiches', icon: Image },
  { key: 'stockage', label: 'Stockage', icon: Database },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'guide', label: 'Aide', icon: Layers },
];

export default function App() {
  const {
    documents, grouped,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    categories, types, statuses,
    addDocument, updateDocument, deleteDocument,
    importDocuments,
  } = useDocuments();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [portalView, setPortalView] = useState(() =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cea-portal-view') === 'app'
      ? 'app'
      : 'landing',
  );

  const enterPortal = () => {
    sessionStorage.setItem('cea-portal-view', 'app');
    setPortalView('app');
  };

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(documents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cea-documents.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [documents]);

  const handleImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try { importDocuments(JSON.parse(e.target?.result)); } catch {}
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [importDocuments]);

  const openAdd = () => { setEditingDoc(null); setModalOpen(true); };
  const openEdit = (doc) => { setEditingDoc(doc); setModalOpen(true); };
  const handleSave = (formData) => {
    if (editingDoc) updateDocument(editingDoc.id, formData);
    else addDocument(formData);
  };
  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce document ?')) deleteDocument(id);
  };

  if (portalView === 'landing') {
    return <WelcomePage onEnter={enterPortal} />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header
        onExport={handleExport}
        onImport={handleImport}
        onAdd={openAdd}
        onShowLanding={() => {
          sessionStorage.removeItem('cea-portal-view');
          setPortalView('landing');
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-8 max-lg:landscape:py-3 max-lg:landscape:space-y-3 space-y-5 sm:space-y-7 safe-pb">
        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-lg:landscape:gap-2 animate-fade-in">
          {[
            { title: 'Documents', value: documents.length, icon: FileText },
            { title: 'Catégories', value: new Set(documents.map(d => d.category)).size, icon: FolderOpen },
            { title: 'Actifs', value: documents.filter(d => d.status === 'Actif').length, icon: ShieldCheck },
            { title: 'Modèles', value: documents.filter(d => d.type === 'Modèle').length, icon: Layers },
          ].map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </section>

        {/* Filters */}
        <SearchFilters
          search={search} setSearch={setSearch}
          categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} categories={categories}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter} types={types}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter} statuses={statuses}
        />

        {/* Tabs */}
        <div className="tabs-nav flex gap-0.5 sm:gap-1 rounded-2xl border border-border p-1 max-lg:landscape:p-0.5 overflow-x-auto max-w-full scrollbar-thin -mx-0.5 px-0.5 pb-0.5 snap-x snap-mandatory scroll-pl-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-2 max-lg:landscape:px-2 max-lg:landscape:py-1.5 max-lg:landscape:text-[11px] text-[12px] sm:text-[13px] font-semibold rounded-lg sm:rounded-xl transition-all duration-250 cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] max-lg:landscape:min-h-[34px] touch-manipulation snap-start ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d] text-white shadow-md shadow-black/25 ring-1 ring-white/10'
                    : 'text-text-muted hover:bg-surface-alt hover:text-primary'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-copper-light' : 'opacity-90'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'documents' && (
          <DocumentList grouped={grouped} onEdit={openEdit} onDelete={handleDelete} />
        )}
        {activeTab === 'memo' && <MemoSection documents={documents} />}
        {activeTab === 'procedures' && <GuidePage />}
        {activeTab === 'associations' && <AssociationsTab />}
        {activeTab === 'evenements' && <EvenementsTab />}
        {activeTab === 'videos' && <VideosTab />}
        {activeTab === 'comptabilite' && <ComptabiliteTab />}
        {activeTab === 'idees' && <IdeesTab />}
        {activeTab === 'affiches' && <AffichesTab />}
        {activeTab === 'stockage' && <StockageTab />}
        {activeTab === 'location' && <LocationTab />}
        {activeTab === 'guide' && <GuideTab />}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#111119] via-[#1c1c2b] to-[#2a2a3d] text-white/50 border-t border-white/5 safe-pb max-lg:landscape:py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 max-lg:landscape:py-2 max-lg:landscape:gap-2 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="/logo-san-andreas.png" alt="" className="w-8 h-8 opacity-60" />
            <div>
              <p className="text-xs font-bold text-white/70">Portail C.E.A</p>
              <p className="text-[10px] text-white/40">State of San Andreas — Tous droits réservés</p>
            </div>
          </div>
          <p className="text-[10px] text-white/30">Communication &bull; Événementiel &bull; Association</p>
        </div>
      </footer>

      <DocumentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingDoc={editingDoc}
      />
    </div>
  );
}

import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function SearchFilters({
  search, setSearch,
  categoryFilter, setCategoryFilter, categories,
  typeFilter, setTypeFilter, types,
  statusFilter, setStatusFilter, statuses,
}) {
  const hasFilters = search || categoryFilter !== 'Toutes' || typeFilter !== 'Tous' || statusFilter !== 'Tous';

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('Toutes');
    setTypeFilter('Tous');
    setStatusFilter('Tous');
  };

  return (
    <div className="search-panel rounded-2xl border border-border p-4 sm:p-5 max-lg:landscape:p-3 max-lg:landscape:rounded-xl animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-4 h-4 text-copper shrink-0" />
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Recherche & Filtres</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            type="text"
            placeholder="Rechercher un document, une catégorie, un tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm text-text bg-surface hover:bg-surface-alt focus:bg-white dark:focus:bg-white/10 transition-all duration-200 placeholder:text-text-light/70"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-border text-sm text-text bg-surface hover:bg-surface-alt cursor-pointer transition-colors min-w-[8rem]"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-border text-sm text-text bg-surface hover:bg-surface-alt cursor-pointer transition-colors min-w-[7rem]"
        >
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-border text-sm text-text bg-surface hover:bg-surface-alt cursor-pointer transition-colors min-w-[7rem]"
        >
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
            Effacer
          </button>
        )}
      </div>
    </div>
  );
}

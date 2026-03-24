import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { seedDocuments } from '../data/seedDocuments';

const fromDb = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  type: row.type,
  status: row.status,
  tags: row.tags || [],
  link: row.link,
  description: row.description,
  contact: row.contact,
  important: row.important,
  updatedAt: row.updated_at,
});

const toDb = (doc) => ({
  title: doc.title,
  category: doc.category,
  type: doc.type,
  status: doc.status,
  tags: typeof doc.tags === 'string'
    ? doc.tags.split(',').map(t => t.trim()).filter(Boolean)
    : (doc.tags || []),
  link: doc.link,
  description: doc.description,
  contact: doc.contact,
  important: doc.important || false,
  updated_at: new Date().toISOString(),
});

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('Tous');

  // Load from Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('documents').select('*');
      if (error) { console.error(error); return; }
      if (data.length === 0 && seedDocuments.length > 0) {
        const toInsert = seedDocuments.map(d => ({ ...toDb(d), id: d.id }));
        const { data: inserted } = await supabase.from('documents').insert(toInsert).select();
        if (inserted) setDocuments(inserted.map(fromDb));
      } else {
        setDocuments(data.map(fromDb));
      }
    })();
  }, []);

  // Dynamic filter options
  const categories = useMemo(
    () => ['Toutes', ...new Set(documents.map(d => d.category))],
    [documents]
  );
  const types = useMemo(
    () => ['Tous', ...new Set(documents.map(d => d.type))],
    [documents]
  );
  const statuses = useMemo(
    () => ['Tous', ...new Set(documents.map(d => d.status))],
    [documents]
  );

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return documents.filter(doc => {
      const text = [doc.title, doc.description, doc.category, doc.type, ...(doc.tags || [])].join(' ').toLowerCase();
      const matchSearch = !q || text.includes(q);
      const matchCategory = categoryFilter === 'Toutes' || doc.category === categoryFilter;
      const matchType = typeFilter === 'Tous' || doc.type === typeFilter;
      const matchStatus = statusFilter === 'Tous' || doc.status === statusFilter;
      return matchSearch && matchCategory && matchType && matchStatus;
    });
  }, [documents, search, categoryFilter, typeFilter, statusFilter]);

  // Grouped by category
  const grouped = useMemo(() => {
    return filtered.reduce((acc, doc) => {
      acc[doc.category] = acc[doc.category] || [];
      acc[doc.category].push(doc);
      return acc;
    }, {});
  }, [filtered]);

  // CRUD
  const addDocument = useCallback(async (doc) => {
    const dbDoc = toDb(doc);
    const { data, error } = await supabase.from('documents').insert(dbDoc).select();
    if (!error && data) setDocuments(prev => [fromDb(data[0]), ...prev]);
  }, []);

  const updateDocument = useCallback(async (id, doc) => {
    const dbDoc = toDb(doc);
    const { data, error } = await supabase.from('documents').update(dbDoc).eq('id', id).select();
    if (!error && data) setDocuments(prev => prev.map(d => d.id === id ? fromDb(data[0]) : d));
  }, []);

  const deleteDocument = useCallback(async (id) => {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (!error) setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  const importDocuments = useCallback(async (docs) => {
    await supabase.from('documents').delete().neq('id', '');
    const toInsert = docs.map(d => toDb(d));
    const { data } = await supabase.from('documents').insert(toInsert).select();
    if (data) setDocuments(data.map(fromDb));
  }, []);

  return {
    documents,
    filtered,
    grouped,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    categories, types, statuses,
    addDocument, updateDocument, deleteDocument,
    importDocuments,
  };
}

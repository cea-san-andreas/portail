import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook générique pour gérer des données CRUD avec Supabase.
 * @param {string} table - Nom de la table Supabase
 * @param {Array} seedData - Données par défaut (insérées si la table est vide au premier chargement)
 * @param {object} options - { columnMap } pour mapper les clés JS vers les colonnes Supabase
 */
export function useSupabaseData(table, seedData = [], options = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { columnMap } = options;

  // Convert JS keys to DB columns
  const toDb = useCallback((item) => {
    if (!columnMap) return item;
    const mapped = {};
    for (const [key, value] of Object.entries(item)) {
      const col = columnMap[key] || key;
      mapped[col] = value;
    }
    return mapped;
  }, [columnMap]);

  // Convert DB columns to JS keys
  const fromDb = useCallback((row) => {
    if (!columnMap) return row;
    const reverseMap = {};
    for (const [key, col] of Object.entries(columnMap)) {
      reverseMap[col] = key;
    }
    const mapped = {};
    for (const [col, value] of Object.entries(row)) {
      const key = reverseMap[col] || col;
      mapped[key] = value;
    }
    return mapped;
  }, [columnMap]);

  // Load data
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error loading ${table}:`, error);
      setLoading(false);
      return;
    }
    if (data.length === 0 && seedData.length > 0) {
      // Seed initial data
      const seeded = seedData.map(item => toDb(item));
      const { data: inserted, error: seedError } = await supabase.from(table).insert(seeded).select();
      if (!seedError && inserted) {
        setItems(inserted.map(fromDb));
      }
    } else {
      setItems(data.map(fromDb));
    }
    setLoading(false);
  }, [table, seedData, toDb, fromDb]);

  useEffect(() => { load(); }, []);

  const add = useCallback(async (item) => {
    const dbItem = toDb(item);
    const { data, error } = await supabase.from(table).insert(dbItem).select();
    if (!error && data) {
      setItems(prev => [...prev, fromDb(data[0])]);
      return { ok: true };
    }
    return { ok: false, error: error?.message || 'Erreur d’enregistrement' };
  }, [table, toDb, fromDb]);

  const update = useCallback(async (id, item) => {
    const dbItem = toDb(item);
    delete dbItem.id; // don't update the PK
    const { data, error } = await supabase.from(table).update(dbItem).eq('id', id).select();
    if (!error && data) {
      setItems(prev => prev.map(it => it.id === id ? fromDb(data[0]) : it));
    }
  }, [table, toDb, fromDb]);

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      setItems(prev => prev.filter(it => it.id !== id));
    }
  }, [table]);

  const reset = useCallback(async () => {
    await supabase.from(table).delete().neq('id', '');
    if (seedData.length > 0) {
      const seeded = seedData.map(item => toDb(item));
      const { data } = await supabase.from(table).insert(seeded).select();
      if (data) setItems(data.map(fromDb));
      else setItems([]);
    } else {
      setItems([]);
    }
  }, [table, seedData, toDb, fromDb]);

  return { items, loading, add, update, remove, reset, reload: load };
}

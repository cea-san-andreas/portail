import { useCallback, useEffect, useState } from 'react';

/**
 * Hook générique pour gérer des données éditables avec persistence localStorage.
 * @param {string} storageKey - Clé localStorage
 * @param {Array} seedData - Données par défaut
 */
export function useEditableData(storageKey, seedData) {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return seedData;
    try { return JSON.parse(raw); } catch { return seedData; }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const add = useCallback((item) => {
    setItems(prev => [...prev, { ...item, _id: Date.now().toString() }]);
  }, []);

  const update = useCallback((index, item) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...item, _id: it._id || Date.now().toString() } : it));
  }, []);

  const remove = useCallback((index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setItems(seedData);
  }, [seedData]);

  return { items, add, update, remove, reset };
}

import { useEffect } from 'react';

export function useKeyboardShortcuts({ onNewDocument, onFocusSearch, onToggleFullscreen }) {
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger in inputs/textareas
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onNewDocument?.();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        onFocusSearch?.();
      }
      if (e.key === 'F11') {
        e.preventDefault();
        onToggleFullscreen?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNewDocument, onFocusSearch, onToggleFullscreen]);
}

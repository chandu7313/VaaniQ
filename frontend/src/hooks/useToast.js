import { useCallback, useEffect, useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  const notify = useCallback((message, type = 'success') => setToast({ message, type }), []);
  return { toast, notify, clear: () => setToast(null) };
}

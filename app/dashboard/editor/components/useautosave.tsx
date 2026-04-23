import { useState, useEffect, useRef, useCallback } from "react";

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 3000,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  const hasMounted = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const performSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(dataRef.current);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Autosave failed:", error);
      // Optional: trigger toast here
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  useEffect(() => {
    if (!enabled) return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      performSave();
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, delay, enabled, performSave]);

  return { isSaving, lastSaved };
}

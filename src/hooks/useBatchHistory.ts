import { useState, useCallback } from 'react';
import { FieldBatch, LocationConsent } from '../types';

const CONSENT_KEY = 'fm_location_consent';
const BATCHES_KEY = 'fm_field_batches';
const MAX_BATCHES = 5;

export function useBatchHistory() {
  const [consent, setConsentState] = useState<LocationConsent>(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as LocationConsent | null;
    return stored ?? 'pending';
  });

  const [batches, setBatches] = useState<FieldBatch[]>(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored !== 'granted') return [];
    try {
      return JSON.parse(localStorage.getItem(BATCHES_KEY) || '[]') as FieldBatch[];
    } catch {
      return [];
    }
  });

  const grantConsent = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'granted');
    setConsentState('granted');
    // Load any existing batch data now that consent is granted
    try {
      const saved = JSON.parse(localStorage.getItem(BATCHES_KEY) || '[]') as FieldBatch[];
      setBatches(saved);
    } catch {
      setBatches([]);
    }
  }, []);

  const denyConsent = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'denied');
    // Wipe any stored batch data immediately
    localStorage.removeItem(BATCHES_KEY);
    setConsentState('denied');
    setBatches([]);
  }, []);

  const saveBatch = useCallback((batch: FieldBatch) => {
    if (consent !== 'granted') return; // hard gate — no-op without consent
    setBatches(prev => {
      const updated = [batch, ...prev].slice(0, MAX_BATCHES);
      localStorage.setItem(BATCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [consent]);

  const clearAll = useCallback(() => {
    localStorage.removeItem(BATCHES_KEY);
    setBatches([]);
  }, []);

  const getLatestBatch = useCallback((): FieldBatch | null => {
    if (consent !== 'granted') return null;
    return batches[0] ?? null;
  }, [consent, batches]);

  return {
    consent,
    grantConsent,
    denyConsent,
    batches,
    saveBatch,
    clearAll,
    getLatestBatch,
  };
}

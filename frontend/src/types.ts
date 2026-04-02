export type Page = 'home' | 'scan' | 'results' | 'history' | 'agent' | 'large-farm';

export interface Top3Prediction {
  class: string;
  plant: string;
  disease: string;
  confidence: number;
}

export interface ScanResult {
  id: string;
  date: string;
  leafType: string;
  disease: string;
  confidence: number;
  image: string;
  remedies: string[];
  recoveryTime: string;
  details: string;
  rawClass?: string;
  top3?: Top3Prediction[];
}

// ─── Field Mapper Types ───────────────────────────────────────────────────────

export interface FieldPhoto {
  id: string;
  file: File;
  dataUrl: string;
  lat: number | null;
  lng: number | null;
  label: string;
  status: 'pending' | 'validating' | 'ready' | 'error' | 'analyzing' | 'done';
  validationError?: string;
}

export interface FieldZoneResult {
  id: string;
  label: string;
  lat: number | null;
  lng: number | null;
  disease: string;
  leafType: string;
  confidence: number;
  isHealthy: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  remedies: string[];
  recoveryTime: string;
  details: string;
  adjacentRisk: boolean;
  protectiveActions: string[];
  image: string;
  rawClass: string;
  batchId: string;
  batchDate: string;
  error?: string;
}

export interface FieldBatch {
  id: string;
  date: string;
  farmName: string;
  zones: FieldZoneResult[];
  unlocatedZones: FieldZoneResult[];
}

export type LocationConsent = 'granted' | 'denied' | 'pending';

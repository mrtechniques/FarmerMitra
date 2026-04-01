export type Page = 'home' | 'scan' | 'results' | 'history' | 'agent';

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

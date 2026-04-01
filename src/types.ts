export type Page = 'home' | 'shop' | 'scan' | 'results' | 'history' | 'agent';

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
}

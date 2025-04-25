export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  type: string;
  usageType: string;
  frequency: string;
  time: string;
  timingNote?: string;
  selectedDays: number[];
  notes?: string;
  taken: boolean;
  stockAmount: number;
  stockUnit: string;
  stockThreshold: number;
  stockLastUpdated: string;
} 
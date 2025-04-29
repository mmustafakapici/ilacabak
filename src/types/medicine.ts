export interface Medicine {
  id: string;
  name: string;
  dosage: {
    amount: number;
    unit: string;
  };
  type: string;
  usage: {
    frequency: string;
    time: string[];
  };
  schedule: {
    startDate: string;
    endDate: string | null;
    reminders: string[];
  };
  notes?: string;
  image?: string;
} 
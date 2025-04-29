export interface MedicineUsage {
  id: string;
  medicineId: string; // İlgili ilacın ID'si
  date: string; // ISO formatında tarih
  time: string; // HH:MM formatında saat
  dosage: {
    amount: number;
    unit: string;
  };
  taken: boolean; // İlaç alındı mı?
  notes?: string; // Ek notlar
}

// Günlük kullanım özeti
export interface DailyUsage {
  date: string; // ISO formatında tarih
  medicines: MedicineUsage[]; // O güne ait ilaç kullanımları
  totalMedicines: number; // Toplam ilaç sayısı
  takenMedicines: number; // Alınan ilaç sayısı
  skippedMedicines: number; // Atlanan ilaç sayısı
}

// Haftalık kullanım özeti
export interface WeeklyUsage {
  startDate: string; // Haftanın başlangıç tarihi
  endDate: string; // Haftanın bitiş tarihi
  dailyUsages: DailyUsage[]; // Günlük kullanımlar
  totalMedicines: number; // Toplam ilaç sayısı
  takenMedicines: number; // Alınan ilaç sayısı
  skippedMedicines: number; // Atlanan ilaç sayısı
  complianceRate: number; // Uyum oranı (0-100 arası)
}

// Aylık kullanım özeti
export interface MonthlyUsage {
  month: string; // YYYY-MM formatında ay
  weeklyUsages: WeeklyUsage[]; // Haftalık kullanımlar
  totalMedicines: number; // Toplam ilaç sayısı
  takenMedicines: number; // Alınan ilaç sayısı
  skippedMedicines: number; // Atlanan ilaç sayısı
  complianceRate: number; // Uyum oranı (0-100 arası)
}

// İlaç kullanım istatistikleri
export interface UsageStatistics {
  totalDays: number; // Toplam gün sayısı
  totalMedicines: number; // Toplam ilaç sayısı
  takenMedicines: number; // Alınan ilaç sayısı
  skippedMedicines: number; // Atlanan ilaç sayısı
  averageComplianceRate: number; // Ortalama uyum oranı
  bestDay: {
    date: string;
    complianceRate: number;
  };
  worstDay: {
    date: string;
    complianceRate: number;
  };
  mostSkippedMedicine: {
    medicineId: string;
    count: number;
  };
  mostCommonSkipReason?: string; // En sık atlama sebebi
} 
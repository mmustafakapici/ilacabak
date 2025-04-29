import AsyncStorage from '@react-native-async-storage/async-storage';
import { MedicineUsage, DailyUsage, WeeklyUsage, MonthlyUsage, UsageStatistics } from '../types/usage';

const USAGE_KEY = '@medicine_usage';

export const UsageService = {
  async addUsage(usage: MedicineUsage): Promise<void> {
    try {
      const usages = await this.getUsages();
      usages.push(usage);
      await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usages));
    } catch (error) {
      console.error('Kullanım kaydı eklenirken hata:', error);
      throw error;
    }
  },

  async getUsages(): Promise<MedicineUsage[]> {
    try {
      const usagesJson = await AsyncStorage.getItem(USAGE_KEY);
      return usagesJson ? JSON.parse(usagesJson) : [];
    } catch (error) {
      console.error('Kullanım kayıtları alınırken hata:', error);
      return [];
    }
  },

  async getUsagesByMedicineId(medicineId: string): Promise<MedicineUsage[]> {
    try {
      const usages = await this.getUsages();
      return usages.filter(usage => usage.medicineId === medicineId);
    } catch (error) {
      console.error('İlaca ait kullanım kayıtları alınırken hata:', error);
      return [];
    }
  },

  async updateUsage(usage: MedicineUsage): Promise<void> {
    try {
      const usages = await this.getUsages();
      const updatedUsages = usages.map(u => u.id === usage.id ? usage : u);
      await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(updatedUsages));
    } catch (error) {
      console.error('Kullanım kaydı güncellenirken hata:', error);
      throw error;
    }
  },

  async deleteUsage(usageId: string): Promise<void> {
    try {
      const usages = await this.getUsages();
      const filteredUsages = usages.filter(u => u.id !== usageId);
      await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(filteredUsages));
    } catch (error) {
      console.error('Kullanım kaydı silinirken hata:', error);
      throw error;
    }
  },

  // Belirli bir tarih aralığındaki kullanımları getir
  async getUsagesByDateRange(startDate: string, endDate: string): Promise<MedicineUsage[]> {
    const usages = await this.getUsages();
    return usages.filter(usage => 
      usage.date >= startDate && usage.date <= endDate
    );
  },

  // Günlük kullanım özeti getir
  async getDailyUsage(date: string): Promise<DailyUsage> {
    const usages = await this.getUsagesByDateRange(date, date);
    const takenMedicines = usages.filter(usage => usage.taken).length;
    
    return {
      date,
      medicines: usages,
      totalMedicines: usages.length,
      takenMedicines,
      skippedMedicines: usages.length - takenMedicines
    };
  },

  // Haftalık kullanım özeti getir
  async getWeeklyUsage(startDate: string): Promise<WeeklyUsage> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const usages = await this.getUsagesByDateRange(
      startDate,
      endDate.toISOString().split('T')[0]
    );

    const dailyUsages = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return this.getDailyUsage(date.toISOString().split('T')[0]);
      })
    );

    const takenMedicines = usages.filter(usage => usage.taken).length;
    const totalMedicines = usages.length;
    const complianceRate = totalMedicines > 0 
      ? (takenMedicines / totalMedicines) * 100 
      : 0;

    return {
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      dailyUsages,
      totalMedicines,
      takenMedicines,
      skippedMedicines: totalMedicines - takenMedicines,
      complianceRate
    };
  },

  // Aylık kullanım özeti getir
  async getMonthlyUsage(month: string): Promise<MonthlyUsage> {
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0)
      .toISOString()
      .split('T')[0];

    const usages = await this.getUsagesByDateRange(startDate, endDate);
    const weeklyUsages: WeeklyUsage[] = [];

    // Her hafta için kullanım özeti oluştur
    let currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
      weeklyUsages.push(await this.getWeeklyUsage(
        currentDate.toISOString().split('T')[0]
      ));
      currentDate.setDate(currentDate.getDate() + 7);
    }

    const takenMedicines = usages.filter(usage => usage.taken).length;
    const totalMedicines = usages.length;
    const complianceRate = totalMedicines > 0 
      ? (takenMedicines / totalMedicines) * 100 
      : 0;

    return {
      month,
      weeklyUsages,
      totalMedicines,
      takenMedicines,
      skippedMedicines: totalMedicines - takenMedicines,
      complianceRate
    };
  },

  // İstatistikleri getir
  async getStatistics(): Promise<UsageStatistics> {
    const usages = await this.getUsages();
    const takenMedicines = usages.filter(usage => usage.taken).length;
    const totalMedicines = usages.length;

    // Günlük uyum oranlarını hesapla
    const dailyRates = new Map<string, number>();
    usages.forEach(usage => {
      const rate = dailyRates.get(usage.date) || 0;
      dailyRates.set(usage.date, rate + (usage.taken ? 1 : 0));
    });

    // En iyi ve en kötü günleri bul
    let bestDay = { date: '', complianceRate: 0 };
    let worstDay = { date: '', complianceRate: 100 };
    dailyRates.forEach((rate, date) => {
      const complianceRate = (rate / usages.filter(u => u.date === date).length) * 100;
      if (complianceRate > bestDay.complianceRate) {
        bestDay = { date, complianceRate };
      }
      if (complianceRate < worstDay.complianceRate) {
        worstDay = { date, complianceRate };
      }
    });

    // En çok atlanan ilacı bul
    const skippedCounts = new Map<string, number>();
    usages
      .filter(usage => !usage.taken)
      .forEach(usage => {
        const count = skippedCounts.get(usage.medicineId) || 0;
        skippedCounts.set(usage.medicineId, count + 1);
      });

    let mostSkippedMedicine = { medicineId: '', count: 0 };
    skippedCounts.forEach((count, medicineId) => {
      if (count > mostSkippedMedicine.count) {
        mostSkippedMedicine = { medicineId, count };
      }
    });

    // En sık atlama sebebini bul
    const skipReasons = new Map<string, number>();
    usages
      .filter(usage => !usage.taken && usage.skippedReason)
      .forEach(usage => {
        const count = skipReasons.get(usage.skippedReason!) || 0;
        skipReasons.set(usage.skippedReason!, count + 1);
      });

    let mostCommonSkipReason = '';
    let maxCount = 0;
    skipReasons.forEach((count, reason) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonSkipReason = reason;
      }
    });

    return {
      totalDays: dailyRates.size,
      totalMedicines,
      takenMedicines,
      skippedMedicines: totalMedicines - takenMedicines,
      averageComplianceRate: totalMedicines > 0 
        ? (takenMedicines / totalMedicines) * 100 
        : 0,
      bestDay,
      worstDay,
      mostSkippedMedicine,
      mostCommonSkipReason: mostCommonSkipReason || undefined
    };
  }
}; 
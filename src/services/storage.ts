import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage anahtarları
const STORAGE_KEYS = {
  MEDICINES: '@medicines',
  USER_PROFILE: '@user_profile',
  SETTINGS: '@settings',
  RELATIVES: '@relatives',
  NOTIFICATIONS: '@notifications',
};

// İlaç verisi için tip tanımı
export interface Medicine {
  id: string;
  name: string;
  type: string; // Tablet, Şurup, İğne, vb.
  dosage: string;
  frequency: "daily" | "weekly" | "custom";
  time: string;
  usageType: string; // Aç/Tok Karnına
  timingNote?: string; // Yemekten kaç dakika önce/sonra
  selectedDays?: number[]; // Haftalık kullanım için seçilen günler
  notes?: string;
  taken: boolean;
  color?: string; // İlacın rengi/görünümü
  image?: string; // İlaç görseli (opsiyonel)
  stockAmount: number; // Mevcut stok miktarı
  stockUnit: string; // Stok birimi (tablet, kapsül, ml vs.)
  stockThreshold: number; // Uyarı eşiği (bu miktarın altına düşünce uyarı verilir)
  stockLastUpdated: string; // Son stok güncellemesi tarihi
  date: string; // İlaç kullanım tarihi
}

// Kullanıcı profili için tip tanımı
export interface UserProfile {
  name: string;
  age: number;
  city: string;
  phone: string;
}

// Ayarlar için tip tanımı
export interface Settings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notifyRelatives: boolean;
  voiceEnabled: boolean;
  theme: "light" | "dark" | "auto";
  fontSize: 'normal' | 'large' | 'extra-large';
  notificationTimes: number[]; // Dakika cinsinden bildirim zamanları
}

// Yakınlar için tip tanımı
export interface Relative {
  id: string;
  name: string;
  phone: string;
  relation: string;
  notifyForMissedMeds: boolean;
  notifyForEmergency: boolean;
  notifyEnabled: boolean;
}

// Sağlık durumu için tip tanımı
export interface HealthStatus {
  bloodPressure: string;
  heartRate: string;
  lastCheck: string;
}

// Randevular için tip tanımı
export interface Appointment {
  id: string;
  doctor: string;
  date: string;
  time: string;
  type: string;
}

// Örnek ilaç şablonları
const MEDICINE_TEMPLATES = [
  {
    name: "Lisinopril",
    type: "Tablet",
    dosage: "10mg",
    frequency: "daily" as const,
    time: "08:00",
    usageType: "Aç karnına",
    timingNote: "Yemekten 1 saat önce",
    notes: "Tansiyon ilacı",
    color: "Beyaz",
    stockAmount: 45,
    stockUnit: "tablet",
    stockThreshold: 10,
  },
  {
    name: "Metformin",
    type: "Tablet",
    dosage: "850mg",
    frequency: "daily" as const,
    time: "12:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 30 dakika sonra",
    notes: "Diyabet ilacı",
    color: "Beyaz",
    stockAmount: 60,
    stockUnit: "tablet",
    stockThreshold: 15,
  },
  {
    name: "Aspirin",
    type: "Tablet",
    dosage: "100mg",
    frequency: "daily" as const,
    time: "20:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 1 saat sonra",
    notes: "Kan sulandırıcı",
    color: "Beyaz",
    stockAmount: 90,
    stockUnit: "tablet",
    stockThreshold: 20,
  },
  {
    name: "Vitamin D",
    type: "Tablet",
    dosage: "1000 IU",
    frequency: "daily" as const,
    time: "09:00",
    usageType: "Tok karnına",
    timingNote: "Kahvaltıdan sonra",
    notes: "Vitamin takviyesi",
    color: "Sarı",
    stockAmount: 30,
    stockUnit: "tablet",
    stockThreshold: 10,
  },
  {
    name: "Omeprazol",
    type: "Kapsül",
    dosage: "20mg",
    frequency: "daily" as const,
    time: "07:00",
    usageType: "Aç karnına",
    timingNote: "Kahvaltıdan 30 dakika önce",
    notes: "Mide koruyucu",
    color: "Beyaz",
    stockAmount: 40,
    stockUnit: "kapsül",
    stockThreshold: 10,
  },
];

// Örnek ilaçlar ekleyelim
const SAMPLE_MEDICINES: Medicine[] = [
  // Bugünkü ilaçlar (1 Nisan 2025)
  {
    id: "1",
    name: "Lisinopril",
    type: "Tablet",
    dosage: "10mg",
    frequency: "daily",
    time: "08:00",
    usageType: "Aç karnına",
    timingNote: "Yemekten 1 saat önce",
    notes: "Tansiyon ilacı",
    taken: true,
    color: "Beyaz",
    stockAmount: 45,
    stockUnit: "tablet",
    stockThreshold: 10,
    stockLastUpdated: "2025-04-01",
    date: "2025-04-01",
  },
  {
    id: "2",
    name: "Metformin",
    type: "Tablet",
    dosage: "850mg",
    frequency: "daily",
    time: "12:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 30 dakika sonra",
    notes: "Diyabet ilacı",
    taken: true,
    color: "Beyaz",
    stockAmount: 60,
    stockUnit: "tablet",
    stockThreshold: 15,
    stockLastUpdated: "2025-04-01",
    date: "2025-04-01",
  },
  {
    id: "3",
    name: "Aspirin",
    type: "Tablet",
    dosage: "100mg",
    frequency: "daily",
    time: "20:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 1 saat sonra",
    notes: "Kan sulandırıcı",
    taken: true,
    color: "Beyaz",
    stockAmount: 90,
    stockUnit: "tablet",
    stockThreshold: 20,
    stockLastUpdated: "2025-04-01",
    date: "2025-04-01",
  },
  {
    id: "4",
    name: "Vitamin D",
    type: "Tablet",
    dosage: "1000 IU",
    frequency: "daily",
    time: "09:00",
    usageType: "Tok karnına",
    timingNote: "Kahvaltıdan sonra",
    notes: "Vitamin takviyesi",
    taken: true,
    color: "Sarı",
    stockAmount: 30,
    stockUnit: "tablet",
    stockThreshold: 10,
    stockLastUpdated: "2025-04-01",
    date: "2025-04-01",
  },
  {
    id: "5",
    name: "Omeprazol",
    type: "Kapsül",
    dosage: "20mg",
    frequency: "daily",
    time: "07:00",
    usageType: "Aç karnına",
    timingNote: "Kahvaltıdan 30 dakika önce",
    notes: "Mide koruyucu",
    taken: true,
    color: "Beyaz",
    stockAmount: 40,
    stockUnit: "kapsül",
    stockThreshold: 10,
    stockLastUpdated: "2025-04-01",
    date: "2025-04-01",
  },
  // Dünkü ilaçlar (31 Mart 2025)
  {
    id: "6",
    name: "Lisinopril",
    type: "Tablet",
    dosage: "10mg",
    frequency: "daily",
    time: "08:00",
    usageType: "Aç karnına",
    timingNote: "Yemekten 1 saat önce",
    notes: "Tansiyon ilacı",
    taken: true,
    color: "Beyaz",
    stockAmount: 45,
    stockUnit: "tablet",
    stockThreshold: 10,
    stockLastUpdated: "2025-03-31",
    date: "2025-03-31",
  },
  {
    id: "7",
    name: "Metformin",
    type: "Tablet",
    dosage: "850mg",
    frequency: "daily",
    time: "12:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 30 dakika sonra",
    notes: "Diyabet ilacı",
    taken: true,
    color: "Beyaz",
    stockAmount: 60,
    stockUnit: "tablet",
    stockThreshold: 15,
    stockLastUpdated: "2025-03-31",
    date: "2025-03-31",
  },
  {
    id: "8",
    name: "Aspirin",
    type: "Tablet",
    dosage: "100mg",
    frequency: "daily",
    time: "20:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 1 saat sonra",
    notes: "Kan sulandırıcı",
    taken: true,
    color: "Beyaz",
    stockAmount: 90,
    stockUnit: "tablet",
    stockThreshold: 20,
    stockLastUpdated: "2025-03-31",
    date: "2025-03-31",
  },
  {
    id: "9",
    name: "Vitamin D",
    type: "Tablet",
    dosage: "1000 IU",
    frequency: "daily",
    time: "09:00",
    usageType: "Tok karnına",
    timingNote: "Kahvaltıdan sonra",
    notes: "Vitamin takviyesi",
    taken: true,
    color: "Sarı",
    stockAmount: 30,
    stockUnit: "tablet",
    stockThreshold: 10,
    stockLastUpdated: "2025-03-31",
    date: "2025-03-31",
  },
  {
    id: "10",
    name: "Omeprazol",
    type: "Kapsül",
    dosage: "20mg",
    frequency: "daily",
    time: "07:00",
    usageType: "Aç karnına",
    timingNote: "Kahvaltıdan 30 dakika önce",
    notes: "Mide koruyucu",
    taken: true,
    color: "Beyaz",
    stockAmount: 40,
    stockUnit: "kapsül",
    stockThreshold: 10,
    stockLastUpdated: "2025-03-31",
    date: "2025-03-31",
  },
  // Önceki günün ilaçları (30 Mart 2025)
  {
    id: "11",
    name: "Lisinopril",
    type: "Tablet",
    dosage: "10mg",
    frequency: "daily",
    time: "08:00",
    usageType: "Aç karnına",
    timingNote: "Yemekten 1 saat önce",
    notes: "Tansiyon ilacı",
    taken: true,
    color: "Beyaz",
    stockAmount: 45,
    stockUnit: "tablet",
    stockThreshold: 10,
    stockLastUpdated: "2025-03-30",
    date: "2025-03-30",
  },
  {
    id: "12",
    name: "Metformin",
    type: "Tablet",
    dosage: "850mg",
    frequency: "daily",
    time: "12:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 30 dakika sonra",
    notes: "Diyabet ilacı",
    taken: true,
    color: "Beyaz",
    stockAmount: 60,
    stockUnit: "tablet",
    stockThreshold: 15,
    stockLastUpdated: "2025-03-30",
    date: "2025-03-30",
  },
  {
    id: "13",
    name: "Aspirin",
    type: "Tablet",
    dosage: "100mg",
    frequency: "daily",
    time: "20:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 1 saat sonra",
    notes: "Kan sulandırıcı",
    taken: true,
    color: "Beyaz",
    stockAmount: 90,
    stockUnit: "tablet",
    stockThreshold: 20,
    stockLastUpdated: "2025-03-30",
    date: "2025-03-30",
  },
  {
    id: "14",
    name: "Vitamin D",
    type: "Tablet",
    dosage: "1000 IU",
    frequency: "daily",
    time: "09:00",
    usageType: "Tok karnına",
    timingNote: "Kahvaltıdan sonra",
    notes: "Vitamin takviyesi",
    taken: true,
    color: "Sarı",
    stockAmount: 30,
    stockUnit: "tablet",
    stockThreshold: 10,
    stockLastUpdated: "2025-03-30",
    date: "2025-03-30",
  },
  {
    id: "15",
    name: "Omeprazol",
    type: "Kapsül",
    dosage: "20mg",
    frequency: "daily",
    time: "07:00",
    usageType: "Aç karnına",
    timingNote: "Kahvaltıdan 30 dakika önce",
    notes: "Mide koruyucu",
    taken: true,
    color: "Beyaz",
    stockAmount: 40,
    stockUnit: "kapsül",
    stockThreshold: 10,
    stockLastUpdated: "2025-03-30",
    date: "2025-03-30",
  },
  // 28 Şubat 2025'ten itibaren kullanılan ilaçlar
  {
    id: "16",
    name: "Lisinopril",
    type: "Tablet",
    dosage: "10mg",
    frequency: "daily",
    time: "08:00",
    usageType: "Aç karnına",
    timingNote: "Yemekten 1 saat önce",
    notes: "Tansiyon ilacı",
    taken: true,
    color: "Beyaz",
    stockAmount: 45,
    stockUnit: "tablet",
    stockThreshold: 10,
    stockLastUpdated: "2025-02-28",
    date: "2025-02-28",
  },
  {
    id: "17",
    name: "Metformin",
    type: "Tablet",
    dosage: "850mg",
    frequency: "daily",
    time: "12:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 30 dakika sonra",
    notes: "Diyabet ilacı",
    taken: true,
    color: "Beyaz",
    stockAmount: 60,
    stockUnit: "tablet",
    stockThreshold: 15,
    stockLastUpdated: "2025-02-28",
    date: "2025-02-28",
  },
  {
    id: "18",
    name: "Aspirin",
    type: "Tablet",
    dosage: "100mg",
    frequency: "daily",
    time: "20:00",
    usageType: "Tok karnına",
    timingNote: "Yemekten 1 saat sonra",
    notes: "Kan sulandırıcı",
    taken: true,
    color: "Beyaz",
    stockAmount: 90,
    stockUnit: "tablet",
    stockThreshold: 20,
    stockLastUpdated: "2025-02-28",
    date: "2025-02-28",
  },
  {
    id: "19",
    name: "Vitamin D",
    type: "Tablet",
    dosage: "1000 IU",
    frequency: "daily",
    time: "09:00",
    usageType: "Tok karnına",
    timingNote: "Kahvaltıdan sonra",
    notes: "Vitamin takviyesi",
    taken: true,
    color: "Sarı",
    stockAmount: 30,
    stockUnit: "tablet",
    stockThreshold: 10,
    stockLastUpdated: "2025-02-28",
    date: "2025-02-28",
  },
  {
    id: "20",
    name: "Omeprazol",
    type: "Kapsül",
    dosage: "20mg",
    frequency: "daily",
    time: "07:00",
    usageType: "Aç karnına",
    timingNote: "Kahvaltıdan 30 dakika önce",
    notes: "Mide koruyucu",
    taken: true,
    color: "Beyaz",
    stockAmount: 40,
    stockUnit: "kapsül",
    stockThreshold: 10,
    stockLastUpdated: "2025-02-28",
    date: "2025-02-28",
  }
];

// Storage servisi
export const StorageService = {
  // İlaçlar
  async getMedicines(): Promise<Medicine[]> {
    try {
      const medicines = await AsyncStorage.getItem(STORAGE_KEYS.MEDICINES);
      return medicines ? JSON.parse(medicines) : [];
    } catch (error) {
      console.error('İlaçlar alınırken hata:', error);
      return [];
    }
  },

  async saveMedicines(medicines: Medicine[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    } catch (error) {
      console.error('İlaçlar kaydedilirken hata:', error);
    }
  },

  async addMedicine(medicine: Medicine): Promise<void> {
    try {
      const medicines = await this.getMedicines();
      medicines.push(medicine);
      await this.saveMedicines(medicines);
    } catch (error) {
      console.error('İlaç eklenirken hata:', error);
    }
  },

  // Kullanıcı profili
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Profil alınırken hata:', error);
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Profil kaydedilirken hata:', error);
    }
  },

  // Ayarlar
  async saveSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error);
      throw error;
    }
  },

  async getSettings(): Promise<Settings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settings) {
        return JSON.parse(settings);
      }
      // Ayarlar yoksa varsayılan ayarları kaydet ve döndür
      await this.saveSettings({
        soundEnabled: true,
        vibrationEnabled: true,
        voiceEnabled: true,
        notifyRelatives: true,
        theme: 'light',
        fontSize: 'normal',
        notificationTimes: [1, 5, 15, 30, 60], // Varsayılan bildirim zamanları
      });
      return {
        soundEnabled: true,
        vibrationEnabled: true,
        voiceEnabled: true,
        notifyRelatives: true,
        theme: 'light',
        fontSize: 'normal',
        notificationTimes: [1, 5, 15, 30, 60],
      };
    } catch (error) {
      console.error('Ayarlar alınırken hata oluştu:', error);
      return {
        soundEnabled: true,
        vibrationEnabled: true,
        voiceEnabled: true,
        notifyRelatives: true,
        theme: 'light',
        fontSize: 'normal',
        notificationTimes: [1, 5, 15, 30, 60],
      };
    }
  },

  // Bildirim Zamanlarını Güncelleme
  async updateNotificationTimes(times: number[]): Promise<void> {
    try {
      const settings = await this.getSettings();
      settings.notificationTimes = times;
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Bildirim zamanları güncellenirken hata:', error);
      throw error;
    }
  },

  // Sağlık durumu
  async getHealthStatus(): Promise<HealthStatus | null> {
    try {
      const status = await AsyncStorage.getItem('healthStatus');
      return status ? JSON.parse(status) : null;
    } catch (error) {
      console.error('Sağlık durumu alınırken hata:', error);
      return null;
    }
  },

  async saveHealthStatus(status: HealthStatus): Promise<void> {
    try {
      await AsyncStorage.setItem('healthStatus', JSON.stringify(status));
    } catch (error) {
      console.error('Sağlık durumu kaydedilirken hata:', error);
    }
  },

  // Yakınlar
  async getRelatives(): Promise<Relative[]> {
    try {
      const relatives = await AsyncStorage.getItem(STORAGE_KEYS.RELATIVES);
      return relatives ? JSON.parse(relatives) : [];
    } catch (error) {
      console.error('Yakınlar alınırken hata:', error);
      return [];
    }
  },

  async saveRelatives(relatives: Relative[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RELATIVES, JSON.stringify(relatives));
    } catch (error) {
      console.error('Yakınlar kaydedilirken hata:', error);
    }
  },

  // Randevular
  async getAppointments(): Promise<Appointment[]> {
    try {
      const appointments = await AsyncStorage.getItem('appointments');
      return appointments ? JSON.parse(appointments) : [];
    } catch (error) {
      console.error('Randevular alınırken hata:', error);
      return [];
    }
  },

  async saveAppointments(appointments: Appointment[]): Promise<void> {
    try {
      await AsyncStorage.setItem('appointments', JSON.stringify(appointments));
    } catch (error) {
      console.error('Randevular kaydedilirken hata:', error);
    }
  },

  // Tüm verileri temizle
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Veriler temizlenirken hata:', error);
    }
  },

  // Örnek ilaçları yükle
  async loadSampleMedicines(): Promise<void> {
    try {
      const today = new Date();
      const sampleMedicines: Medicine[] = [];
      let medicineId = 1;

      // Son 5 günün ilaçlarını oluştur
      for (let i = 5; i >= 0; i--) {
        const currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() - i);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Her gün için bir ilaç ekle (dönüşümlü olarak)
        const templateIndex = i % MEDICINE_TEMPLATES.length;
        const template = MEDICINE_TEMPLATES[templateIndex];
        
        sampleMedicines.push({
          id: medicineId.toString(),
          ...template,
          taken: i > 0, // Bugünün ilaçları hariç hepsi alınmış olsun
          stockLastUpdated: dateStr,
          date: dateStr,
        });
        medicineId++;
      }

      await this.saveMedicines(sampleMedicines);
    } catch (error) {
      console.error('Örnek ilaçlar yüklenirken hata:', error);
    }
  }
}; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine } from '../types/medicine';
import { MedicineUsage } from '../types/usage';
import { UsageService } from './UsageService';
import { UserProfile } from '../types/user';
import { Settings } from '../types/settings';
import { Relative } from '../types/relative';

// Storage anahtarları
const STORAGE_KEYS = {
  MEDICINES: '@medicines',
  USER_PROFILE: '@user_profile',
  SETTINGS: '@settings',
  RELATIVES: '@relatives',
  NOTIFICATIONS: '@notifications',
  FIRST_LAUNCH: '@first_launch',
};

// İlaç verisi için tip tanımı
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
    condition?: string;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    reminders: Array<{
      time: string;
      enabled: boolean;
    }>;
  };
  notes?: string;
  image?: string;
  taken?: boolean;
  lastTaken?: string;
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
  fontSize: 'small' | 'medium' | 'large';
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

// Storage servisi
export const StorageService = {
  // İlaçlar
  async getMedicines(): Promise<Medicine[]> {
    try {
      const medicinesJson = await AsyncStorage.getItem(STORAGE_KEYS.MEDICINES);
      return medicinesJson ? JSON.parse(medicinesJson) : [];
    } catch (error) {
      console.error('İlaçlar okunurken hata:', error);
      return [];
    }
  },

  async saveMedicines(medicines: Medicine[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    } catch (error) {
      console.error('İlaçlar kaydedilirken hata:', error);
      throw error;
    }
  },

  async addMedicine(medicine: Medicine): Promise<void> {
    try {
      const medicines = await this.getMedicines();
      medicines.push(medicine);
      await this.saveMedicines(medicines);

      // İlaç eklendiğinde kullanım kaydı oluştur
      const usage: MedicineUsage = {
        id: Date.now().toString(),
        medicineId: medicine.id,
        date: new Date().toISOString().split('T')[0],
        time: medicine.schedule.reminders[0]?.time || '00:00',
        dosage: medicine.dosage,
        taken: false,
        notes: 'İlaç kaydı oluşturuldu'
      };

      await UsageService.addUsage(usage);
    } catch (error) {
      console.error('İlaç eklenirken hata:', error);
    }
  },

  async updateMedicine(medicine: Medicine): Promise<void> {
    try {
      const medicines = await this.getMedicines();
      const updatedMedicines = medicines.map((med) =>
        med.id === medicine.id ? medicine : med
      );
      await this.saveMedicines(updatedMedicines);

      // İlaç güncellendiğinde kullanım kaydı oluştur
      const usage: MedicineUsage = {
        id: Date.now().toString(),
        medicineId: medicine.id,
        date: new Date().toISOString().split('T')[0],
        time: medicine.schedule.reminders[0]?.time || '00:00',
        dosage: medicine.dosage,
        taken: false,
        notes: 'İlaç bilgileri güncellendi'
      };

      await UsageService.addUsage(usage);
    } catch (error) {
      console.error('İlaç güncellenirken hata:', error);
    }
  },

  async deleteMedicine(id: string): Promise<void> {
    try {
      const medicines = await this.getMedicines();
      const updatedMedicines = medicines.filter((med) => med.id !== id);
      await this.saveMedicines(updatedMedicines);

      // İlaç silindiğinde kullanım kaydı oluştur
      const usage: MedicineUsage = {
        id: Date.now().toString(),
        medicineId: id,
        date: new Date().toISOString().split('T')[0],
        time: '00:00',
        dosage: { amount: 0, unit: 'tablet' },
        taken: false,
        notes: 'İlaç kaydı silindi'
      };

      await UsageService.addUsage(usage);
    } catch (error) {
      console.error('İlaç silinirken hata:', error);
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
      throw error;
    }
  },

  // Ayarlar
  async getSettings(): Promise<Settings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settings) {
        return JSON.parse(settings);
      }
      // Varsayılan ayarlar
      const defaultSettings: Settings = {
        soundEnabled: true,
        vibrationEnabled: true,
        voiceEnabled: true,
        notifyRelatives: true,
        theme: 'light',
        fontSize: 'medium',
        notificationTimes: [1, 5, 15, 30, 60],
      };
      await this.saveSettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Ayarlar alınırken hata:', error);
      throw error;
    }
  },

  async saveSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      throw error;
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
      throw error;
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

  // İlk kullanım kontrolü
  async getFirstLaunch(): Promise<boolean | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      return value === null ? null : JSON.parse(value);
    } catch (error) {
      console.error('İlk kullanım kontrolü hatası:', error);
      return null;
    }
  },

  async setFirstLaunch(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, JSON.stringify(value));
    } catch (error) {
      console.error('İlk kullanım değeri kaydedilirken hata:', error);
      throw error;
    }
  },

  // Tüm verileri temizle
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Veriler temizlenirken hata:', error);
      throw error;
    }
  },
}; 
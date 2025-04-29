import { Medicine } from '../types/medicine';

interface RawMedicineData {
  name?: string;
  dosage?: {
    amount?: number | string;
    unit?: string;
  };
  type?: string;
  usage?: {
    frequency?: string;
    time?: string | string[];
    condition?: string;
  };
  schedule?: {
    startDate?: string;
    endDate?: string;
    reminders?: Array<{
      time?: string;
      enabled?: boolean;
    }>;
  };
  notes?: string;
}

export class TextParserService {
  private static readonly TIME_MAP: { [key: string]: string } = {
    'SABAH': '08:00',
    'ÖĞLE': '12:00',
    'AKŞAM': '18:00',
    'GECE': '22:00',
    'MORNING': '08:00',
    'NOON': '12:00',
    'EVENING': '18:00',
    'NIGHT': '22:00'
  };

  private static readonly FREQUENCY_MAP: { [key: string]: string } = {
    'GÜNLÜK': 'GÜNLÜK',
    'HAFTALIK': 'HAFTALIK',
    'AYLIK': 'AYLIK',
    'ÖZEL': 'ÖZEL',
    'GÜNDE 1': 'GÜNLÜK',
    'GÜNDE 2': 'GÜNLÜK',
    'GÜNDE 3': 'GÜNLÜK',
    'GÜNDE 4': 'GÜNLÜK',
    'HER GÜN': 'GÜNLÜK',
    'HAFTADA 1': 'HAFTALIK',
    'HAFTADA 2': 'HAFTALIK',
    'HAFTADA 3': 'HAFTALIK',
    'AYDA 1': 'AYLIK'
  };

  private static readonly TYPE_MAP: { [key: string]: string } = {
    'TABLET': 'TABLET',
    'KAPSÜL': 'KAPSÜL',
    'ŞURUP': 'ŞURUP',
    'İĞNE': 'İĞNE',
    'AMPUL': 'AMPUL',
    'DAMLA': 'DAMLA',
    'GARGARA': 'GARGARA',
    'AĞRI KESİCİ': 'TABLET',
    'ATEŞ DÜŞÜRÜCÜ': 'TABLET',
    'ANTİBİYOTİK': 'TABLET',
    'VİTAMİN': 'TABLET',
    'MİNERAL': 'TABLET',
    'PROBİYOTİK': 'KAPSÜL',
    'ANTİHİSTAMİNİK': 'TABLET',
    'ANTİASİT': 'TABLET',
    'LAKSATİF': 'TABLET',
    'ANTİDEPRESAN': 'TABLET',
    'ANTİDİYABETİK': 'TABLET',
    'ANTİHİPERTANSİF': 'TABLET',
    'ANTİKOAGÜLAN': 'TABLET',
    'BRONKODİLATÖR': 'TABLET',
    'DİÜRETİK': 'TABLET',
    'STATİN': 'TABLET',
    'TİROİD': 'TABLET'
  };

  private static readonly UNIT_MAP: { [key: string]: string } = {
    'MG': 'MG',
    'ML': 'ML',
    'MCG': 'MCG',
    'GR': 'GR',
    'IU': 'IU',
    'M': 'MG',
    'MG/ML': 'MG',
    'MG/30M': 'MG',
    'MG/5ML': 'MG',
    'MG/10ML': 'MG',
    'MG/100ML': 'MG',
    'MG/GR': 'MG',
    'MG/KG': 'MG',
    'MCG/ML': 'MCG',
    'MCG/GR': 'MCG',
    'MCG/KG': 'MCG',
    'GR/ML': 'GR',
    'GR/100ML': 'GR'
  };

  private static readonly CONDITION_MAP: { [key: string]: string } = {
    'TOK KARNINA': 'TOK KARNINA',
    'AÇ KARNINA': 'AÇ KARNINA',
    'YEMEKLERLE': 'YEMEKLERLE',
    'YEMEKLERDEN SONRA': 'YEMEKLERDEN SONRA',
    'YEMEKLERDEN ÖNCE': 'YEMEKLERDEN ÖNCE',
    'YEMEKLERDEN 1 SAAT ÖNCE': 'YEMEKLERDEN 1 SAAT ÖNCE',
    'YEMEKLERDEN 2 SAAT ÖNCE': 'YEMEKLERDEN 2 SAAT ÖNCE',
    'YEMEKLERDEN 1 SAAT SONRA': 'YEMEKLERDEN 1 SAAT SONRA',
    'YEMEKLERDEN 2 SAAT SONRA': 'YEMEKLERDEN 2 SAAT SONRA',
    'HERHANGİ BİR ZAMANDA': 'HERHANGİ BİR ZAMANDA'
  };

  private static cleanJsonString(jsonString: string): string {
    return jsonString
      .replace(/[\n\r]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static normalizeName(name: string | undefined): string {
    return name || 'Bilinmeyen İlaç';
  }

  private static normalizeAmount(amount: number | string | undefined): number {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      const num = parseFloat(amount.replace(/[^\d.,]/g, '').replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  private static normalizeUnit(unit: string | undefined): string {
    if (!unit) return 'MG';
    const normalized = unit.toUpperCase();
    return ['MG', 'ML', 'MCG', 'GR'].includes(normalized) ? normalized : 'MG';
  }

  private static normalizeType(type: string | undefined): string {
    if (!type) return 'TABLET';
    const normalized = type.toUpperCase();
    return ['TABLET', 'KAPSÜL', 'ŞURUP', 'İĞNE', 'AMPUL', 'DAMLA', 'GARGARA'].includes(normalized) 
      ? normalized 
      : 'TABLET';
  }

  private static normalizeFrequency(frequency: string | undefined): string {
    if (!frequency) return 'GÜNLÜK';
    const normalized = frequency.toUpperCase();
    return ['GÜNLÜK', 'HAFTALIK', 'AYLIK', 'ÖZEL'].includes(normalized) 
      ? normalized 
      : 'GÜNLÜK';
  }

  private static normalizeTime(time: string | string[] | undefined): string[] {
    if (!time) return ['08:00'];
    
    if (Array.isArray(time)) {
      return time.map(t => this.TIME_MAP[t.toUpperCase()] || t);
    }
    
    const times = time.split(',').map(t => t.trim());
    return times.map(t => this.TIME_MAP[t.toUpperCase()] || t);
  }

  private static normalizeCondition(condition: string | undefined): string {
    return condition || '';
  }

  private static normalizeDate(date: string | undefined): string {
    if (!date) return new Date().toISOString().split('T')[0];
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  private static normalizeNotes(notes: string | undefined): string {
    return notes || '';
  }

  private static createReminders(time: string | string[] | undefined): Array<{ time: string; enabled: boolean }> {
    const times = this.normalizeTime(time);
    return times.map(t => ({
      time: t,
      enabled: true
    }));
  }

  public static parseText(jsonString: string): Medicine {
    try {
      console.log('TextParser: Ham JSON:', jsonString);
      
      // JSON string'i temizle
      const cleanedJson = this.cleanJsonString(jsonString);
      
      // JSON string'i parse et
      const rawData: RawMedicineData = JSON.parse(cleanedJson);
      console.log('TextParser: Parse edilmiş veri:', rawData);
      
      // Medicine tipine dönüştür
      const medicine: Medicine = {
        id: Date.now().toString(),
        name: this.normalizeName(rawData.name),
        dosage: {
          amount: this.normalizeAmount(rawData.dosage?.amount),
          unit: this.normalizeUnit(rawData.dosage?.unit)
        },
        type: this.normalizeType(rawData.type),
        usage: {
          frequency: this.normalizeFrequency(rawData.usage?.frequency),
          time: this.normalizeTime(rawData.usage?.time),
          condition: this.normalizeCondition(rawData.usage?.condition)
        },
        schedule: {
          startDate: this.normalizeDate(rawData.schedule?.startDate),
          endDate: rawData.schedule?.endDate ? this.normalizeDate(rawData.schedule.endDate) : undefined,
          reminders: this.createReminders(rawData.usage?.time)
        },
        notes: this.normalizeNotes(rawData.notes),
        taken: false
      };

      console.log('TextParser: Oluşturulan Medicine:', medicine);
      return medicine;
    } catch (error) {
      console.error('TextParser Hatası:', error);
      // Hata durumunda varsayılan bir ilaç nesnesi döndür
      return {
        id: Date.now().toString(),
        name: 'Bilinmeyen İlaç',
        dosage: {
          amount: 0,
          unit: 'MG'
        },
        type: 'TABLET',
        usage: {
          frequency: 'GÜNLÜK',
          time: ['08:00'],
          condition: ''
        },
        schedule: {
          startDate: new Date().toISOString().split('T')[0],
          reminders: [{ time: '08:00', enabled: true }]
        },
        notes: '',
        taken: false
      };
    }
  }
} 
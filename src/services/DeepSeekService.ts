import { OPENROUTER_API_KEY } from '@env';
import OpenAI from 'openai';
import { Medicine } from '../types/medicine';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    
    "X-Title": "İlaç Takip Uygulaması",
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`
  },
});

export class DeepSeekService {
  public static async processText(text: string): Promise<string> {
    try {
      console.log('\n=== DEEPSEEK İŞLEMİ BAŞLADI ===');
      console.log('Ham Metin:', text);
      
      const prompt = `Aşağıdaki metinden ilaç bilgilerini çıkar ve JSON formatında döndür. 
JSON yapısı şu şekilde olmalıdır:

{
  "name": "string", // İlacın adı
  "dosage": {
    "amount": number, // Dozaj miktarı
    "unit": "string" // Dozaj birimi (mg, ml, IU, tablet, kapsül vb.)
  },
  "type": "string", // İlacın türü (Tablet, Kapsül, Şurup, Damla, Sprey, Gargara vb.)
  "usage": {
    "frequency": "string", // Kullanım sıklığı (GÜNLÜK, HAFTALIK, AYLIK)
    "time": ["string"], // Kullanım zamanları array olarak (["SABAH"], ["SABAH", "AKŞAM"], ["SABAH", "ÖĞLEN", "AKŞAM"] vb.)
    "condition": "string" // Kullanım koşulu (Aç karnına, Tok karnına, Yemeklerden sonra vb.)
  },
  "schedule": {
    "startDate": "string", // Başlangıç tarihi (ISO format)
    "endDate": "string", // Bitiş tarihi (ISO format, opsiyonel)
    "reminders": [
      {
        "time": "string", // Hatırlatma saati (HH:MM format)
        "enabled": boolean // Hatırlatma aktif mi
      }
    ]
  },
  "notes": "string" // Ek notlar
}

Metin: ${text}`;

      const completion = await openai.chat.completions.create({
        //model: "tngtech/deepseek-r1t-chimera:free",
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: "system",
            content: `Sen bir ilaç etiket bilgisi çözümleyicisin. Sana verilen bilgiyi sadece JSON formatında, verilen şablona uyarak döndür.
            Önemli Notlar:
            - Tarihleri ISO formatında döndür (YYYY-MM-DD)
            - Kullanım zamanlarını SABAH, ÖĞLEN, AKŞAM, GECE şeklinde virgülle ayırarak döndür
            - Dozaj birimlerini MG, ML, MCG olarak standardize et
            - İlaç tipini TABLET, KAPSÜL, ŞURUP, İĞNE, AMPUL, DAMLA, GARGARA olarak belirle
            - Sadece JSON formatında yanıt ver, başka hiçbir açıklama veya metin ekleme`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('OpenRouter API yanıtı boş');
      }

      console.log('DeepSeek Yanıtı:', content);
      console.log('=== DEEPSEEK İŞLEMİ TAMAMLANDI ===\n');
      
      // Yanıtı temizle ve JSON'a dönüştür
      const cleanedContent = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const rawData = JSON.parse(cleanedContent);

      // Medicine tipine dönüştür
      const medicineInfo: Medicine = {
        id: rawData.id || Date.now().toString(),
        name: rawData.name || '',
        dosage: {
          amount: rawData.dosage?.amount || 0,
          unit: rawData.dosage?.unit || 'tablet'
        },
        type: rawData.type || 'Tablet',
        usage: {
          frequency: rawData.usage?.frequency || 'GÜNLÜK',
          time: Array.isArray(rawData.usage?.time) ? rawData.usage.time : [rawData.usage?.time || 'SABAH'],
          condition: rawData.usage?.condition || ''
        },
        schedule: {
          startDate: rawData.schedule?.startDate || new Date().toISOString(),
          endDate: rawData.schedule?.endDate,
          reminders: rawData.schedule?.reminders || []
        },
        notes: rawData.notes || '',
        image: '',
        taken: false,
        lastTaken: null
      };

      return JSON.stringify(medicineInfo);
      
    } catch (error) {
      console.error('DeepSeek API Hatası:', error);
      throw error;
    }
  }
} 
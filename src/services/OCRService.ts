import { recognizeText } from 'react-native-tesseract-ocr';

interface OCRResult {
  text: string;
  medicineInfo?: {
    name?: string;
    dosage?: string;
    type?: string;
    usage?: string;
  };
}

export const OCRService = {
  async processImage(imageUri: string): Promise<OCRResult> {
    try {
      const text = await recognizeText(imageUri, 'TUR');
      
      // OCR sonucunu işle
      const medicineInfo = this.extractMedicineInfo(text);

      return {
        text,
        medicineInfo,
      };
    } catch (error) {
      console.error('OCR işlemi sırasında hata:', error);
      throw error;
    }
  },

  extractMedicineInfo(text: string): OCRResult['medicineInfo'] {
    const lines = text.split('\n').map(line => line.trim());
    const medicineInfo: OCRResult['medicineInfo'] = {};

    for (const line of lines) {
      // İlaç adı tespiti (genellikle ilk satırda ve büyük harflerle)
      if (line.match(/^[A-ZĞÜŞİÖÇ\s]+\s*\d*\s*(MG|ML|MCG)?$/)) {
        medicineInfo.name = line.trim();
        continue;
      }

      // Dozaj tespiti
      const dosageMatch = line.match(/(\d+)\s*(MG|ML|MCG)/i);
      if (dosageMatch && !medicineInfo.dosage) {
        medicineInfo.dosage = dosageMatch[0];
        continue;
      }

      // İlaç tipi tespiti
      const typeMatch = line.match(/(TABLET|KAPSÜL|ŞURUP|İĞNE|AMPUL|DAMLA)/i);
      if (typeMatch && !medicineInfo.type) {
        medicineInfo.type = typeMatch[0];
        continue;
      }

      // Kullanım şekli tespiti
      if (line.includes('TOK KARNINA') || line.includes('AÇ KARNINA')) {
        medicineInfo.usage = line.trim();
        continue;
      }
    }

    return medicineInfo;
  },
}; 
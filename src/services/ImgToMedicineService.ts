import { analyzeImage } from './visionService';
import { DeepSeekService } from './DeepSeekService';
import { TextParserService } from './TextParserService';
import { Medicine } from '../types/medicine';

export class ImgToMedicineService {
  public static async processImageToMedicine(imageUri: string): Promise<Medicine> {
    try {
      console.log('\n=== İLAÇ BİLGİSİ İŞLEME BAŞLADI ===');
      
      // 1. Vision API ile görüntüyü işle
      console.log('Vision API ile görüntü işleniyor...');
      const visionResult = await analyzeImage(imageUri);
      const rawText = visionResult.fullTextAnnotation?.text || '';
      console.log('Ham Metin:', rawText);
      
      // 2. DeepSeek ile ham metni işle
      console.log('DeepSeek ile metin işleniyor...');
      const deepSeekResponse = await DeepSeekService.processText(rawText);
      console.log('DeepSeek Yanıtı:', deepSeekResponse);
      
      // 3. TextParser ile Medicine formatına dönüştür
      console.log('TextParser ile format dönüşümü yapılıyor...');
      const medicine = TextParserService.parseText(deepSeekResponse);
      console.log('Oluşturulan İlaç:', medicine);
      
      console.log('=== İLAÇ BİLGİSİ İŞLEME TAMAMLANDI ===\n');
      return medicine;
      
    } catch (error) {
      console.error('İlaç bilgisi işlenirken hata:', error);
      throw new Error('İlaç bilgisi işlenemedi. Lütfen tekrar deneyin.');
    }
  }
} 
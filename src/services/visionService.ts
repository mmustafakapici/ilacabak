import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { GOOGLE_VISION_API_KEY } from '@env';

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export interface VisionResponse {
  textAnnotations?: Array<{
    description: string;
    boundingPoly: {
      vertices: Array<{ x: number; y: number }>;
    };
  }>;
  fullTextAnnotation?: {
    text: string;
  };
}

export const analyzeImage = async (imageUri: string): Promise<VisionResponse> => {
  try {
    console.log('API Key:', GOOGLE_VISION_API_KEY ? 'Mevcut' : 'Eksik');
    
    // Resmi base64'e çevir
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Base64 image length:', base64Image.length);

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    console.log('API isteği gönderiliyor...');
    const response = await axios.post(`${VISION_API_URL}?key=${GOOGLE_VISION_API_KEY}`, requestBody);
    console.log('API yanıtı alındı');
    
    return response.data.responses[0];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Vision API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
}; 
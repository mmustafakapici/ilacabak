declare module 'react-native-tesseract-ocr' {
  export function recognizeText(imagePath: string, language: string): Promise<string>;
} 
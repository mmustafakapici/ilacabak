export interface UserProfile {
  id: string;
  name: string;
  age: number;
  healthConditions: string[];
  notificationPreferences: {
    sound: boolean;
    vibration: boolean;
    visual: boolean;
  };
} 
export interface Settings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notifyRelatives: boolean;
  voiceEnabled: boolean;
  theme: "light" | "dark" | "auto";
  fontSize: 'small' | 'medium' | 'large';
  notificationTimes: number[];
} 
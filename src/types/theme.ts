export interface ThemeColors {
  primary: string;
  secondary: string;
  warning: string;
  error: string;
  background: {
    main: string;
    secondary: string;
    card: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeColors;
  isDarkMode: boolean;
  toggleTheme: () => void;
} 
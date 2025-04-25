import { createTheme } from '@mui/material/styles';

// Açık tema
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196F3', // Ana mavi
      light: '#64B5F6',
      dark: '#1976D2',
    },
    secondary: {
      main: '#4CAF50', // Yeşil
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FF5722', // Turuncu
      light: '#FF8A65',
      dark: '#E64A19',
    },
    error: {
      main: '#F44336', // Kırmızı
      light: '#E57373',
      dark: '#D32F2F',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '16px',
          fontSize: '20px',
          minHeight: '56px',
          minWidth: '48px',
        },
        sizeLarge: {
          height: '64px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px',
        },
      },
    },
  },
});

// Koyu tema
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9', // Daha açık mavi
      light: '#BBE0FB',
      dark: '#5D99C6',
    },
    secondary: {
      main: '#81C784', // Daha açık yeşil
      light: '#A5D6A7',
      dark: '#519657',
    },
    warning: {
      main: '#FFB74D', // Daha açık turuncu
      light: '#FFC777',
      dark: '#C88937',
    },
    error: {
      main: '#EF5350', // Daha açık kırmızı
      light: '#F27573',
      dark: '#B61827',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  // Typography ve components ayarları light theme ile aynı
  typography: lightTheme.typography,
  components: lightTheme.components,
});

// Yüksek kontrastlı tema
export const highContrastTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
    },
    secondary: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#CCCCCC',
    },
    warning: {
      main: '#FFD700',
      light: '#FFE44D',
      dark: '#B39700',
    },
    error: {
      main: '#FF0000',
      light: '#FF3333',
      dark: '#CC0000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
  },
  typography: {
    ...lightTheme.typography,
    allVariants: {
      color: '#000000',
    },
  },
  components: lightTheme.components,
}); 
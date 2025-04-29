import React, { createContext, useContext, useState } from "react";

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
    };
    body1: {
      fontSize: number;
      fontWeight: string;
    };
    body2: {
      fontSize: number;
      fontWeight: string;
    };
  };
}

const defaultTheme: Theme = {
  colors: {
    primary: "#2196F3",
    secondary: "#4CAF50",
    background: "#F5F5F5",
    surface: "#FFFFFF",
    text: "#212121",
    textSecondary: "#757575",
    error: "#F44336",
    success: "#4CAF50",
    warning: "#FFC107",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: "600",
    },
    h2: {
      fontSize: 28,
      fontWeight: "600",
    },
    h3: {
      fontSize: 24,
      fontWeight: "500",
    },
    body1: {
      fontSize: 20,
      fontWeight: "400",
    },
    body2: {
      fontSize: 16,
      fontWeight: "400",
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme: Theme = {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      ...(isDarkMode
        ? {
            background: "#121212",
            surface: "#1E1E1E",
            text: "#FFFFFF",
            textSecondary: "#B0B0B0",
          }
        : {}),
    },
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

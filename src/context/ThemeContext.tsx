import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme, highContrastTheme } from "../theme/theme";

export type ThemeMode = "light" | "dark" | "highContrast";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Local storage'dan tema tercihini al
    const savedTheme = localStorage.getItem("themeMode");
    return (savedTheme as ThemeMode) || "light";
  });

  useEffect(() => {
    // Tema değiştiğinde local storage'a kaydet
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  const getTheme = () => {
    switch (themeMode) {
      case "dark":
        return darkTheme;
      case "highContrast":
        return highContrastTheme;
      default:
        return lightTheme;
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      <MuiThemeProvider theme={getTheme()}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

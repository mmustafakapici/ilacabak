import React from "react";
import {
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Brightness7,
  Brightness4,
  ContrastOutlined,
} from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";
import type { ThemeMode } from "../context/ThemeContext";

export const ThemeSelector: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme();
  const muiTheme = useMuiTheme();

  const handleThemeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTheme: ThemeMode | null
  ) => {
    if (newTheme !== null) {
      setThemeMode(newTheme);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tema Seçimi
        </Typography>
        <ToggleButtonGroup
          value={themeMode}
          exclusive
          onChange={handleThemeChange}
          aria-label="tema seçimi"
          sx={{
            width: "100%",
            "& .MuiToggleButton-root": {
              height: "64px",
              fontSize: "1.1rem",
              flex: 1,
            },
          }}
        >
          <ToggleButton value="light" aria-label="açık tema">
            <Brightness7 sx={{ mr: 1 }} />
            Açık Tema
          </ToggleButton>
          <ToggleButton value="dark" aria-label="koyu tema">
            <Brightness4 sx={{ mr: 1 }} />
            Koyu Tema
          </ToggleButton>
          <ToggleButton value="highContrast" aria-label="yüksek kontrast">
            <ContrastOutlined sx={{ mr: 1 }} />
            Yüksek Kontrast
          </ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          Seçili tema:{" "}
          {themeMode === "light"
            ? "Açık Tema"
            : themeMode === "dark"
            ? "Koyu Tema"
            : "Yüksek Kontrast"}
        </Typography>
      </CardContent>
    </Card>
  );
};

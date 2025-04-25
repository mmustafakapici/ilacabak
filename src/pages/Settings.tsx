import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { ThemeSelector } from "../components/ThemeSelector";

export const Settings: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ayarlar
        </Typography>

        <Box sx={{ mt: 4 }}>
          <ThemeSelector />

          {/* Diğer ayarlar buraya eklenebilir */}
        </Box>
      </Box>
    </Container>
  );
};

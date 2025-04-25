import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "../theme/ThemeContext";

export const ThemeToggleButton: React.FC = () => {
  const { isDarkMode, toggleTheme, theme } = useThemeContext();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.background.card }]}
      onPress={toggleTheme}
    >
      <Ionicons
        name={isDarkMode ? "moon" : "sunny"}
        size={24}
        color={theme.text.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 24,
    margin: 8,
  },
});

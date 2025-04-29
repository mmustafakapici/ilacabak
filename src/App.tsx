import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StorageService } from "./services/storage";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { AddMedicineScreen } from "./screens/AddMedicineScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { NotificationSettingsScreen } from "./screens/NotificationSettingsScreen";
import { MedicineProvider } from "./context/MedicineContext";
import { ThemeProvider } from "./context/ThemeContext";
import BottomTabNavigator from "./navigation/BottomTabNavigator";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Örnek ilaçları yükle
      await StorageService.loadSampleMedicines();
    } catch (error) {
      console.error("Uygulama başlatılırken hata:", error);
    }
  };

  return (
    <ThemeProvider>
    <MedicineProvider>
      <NavigationContainer>
          <BottomTabNavigator />
      </NavigationContainer>
    </MedicineProvider>
    </ThemeProvider>
  );
}

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
    <MedicineProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#2196F3",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 24,
            },
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Ana Sayfa" }}
          />
          <Stack.Screen
            name="AddMedicine"
            component={AddMedicineScreen}
            options={{ title: "İlaç Ekle" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Profil" }}
          />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
            options={{ title: "Bildirim Ayarları" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </MedicineProvider>
  );
}

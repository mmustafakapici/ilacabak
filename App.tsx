import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView, Platform, StatusBar, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeProvider } from "./src/context/ThemeContext";
import { MedicineProvider } from "./src/context/MedicineContext";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AddMedicineScreen from "./src/screens/AddMedicineScreen";
import EditMedicineScreen from "./src/screens/EditMedicineScreen";
import MedicinesScreen from "./src/screens/MedicinesScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { StorageService } from "./src/services/storage";
import { useTheme } from "./src/context/ThemeContext";
import DailyMedicineScreen from "./src/screens/DailyMedicineScreen";

console.log("🚀 Uygulama başlatılıyor...");

export type RootStackParamList = {
  Welcome: undefined;
  HomeScreen: undefined;
  AddMedicineScreen: undefined;
  EditMedicineScreen: { medicineId: string };
  MedicinesScreen: undefined;
  CalendarScreen: undefined;
  ProfileScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const Container = Platform.OS === "ios" ? SafeAreaView : View;

console.log("📱 Platform:", Platform.OS);

const TabNavigator = () => {
  const { theme } = useTheme();
  console.log("🎨 Tema yükleniyor:", theme);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
          tabBarLabel: "Ana Sayfa",
        }}
      />
      <Tab.Screen
        name="MedicinesScreen"
        component={MedicinesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medication" size={size} color={color} />
          ),
          tabBarLabel: "İlaçlarım",
        }}
      />
      <Tab.Screen
        name="DailyMedicineScreen"
        component={DailyMedicineScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="schedule" size={size} color={color} />
          ),
          tabBarLabel: "Günlük Dozlar",
        }}
      />
      <Tab.Screen
        name="CalendarScreen"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
          tabBarLabel: "Takvim",
        }}
      />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
          tabBarLabel: "Profil",
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("📱 Uygulama durumu:", isFirstLaunch);

  useEffect(() => {
    console.log("🔄 İlk kullanım kontrolü başlatılıyor...");
    const checkFirstLaunch = async () => {
      try {
        const firstLaunch = await StorageService.getFirstLaunch();
        console.log("✅ İlk kullanım durumu:", firstLaunch);
        setIsFirstLaunch(firstLaunch === null ? true : firstLaunch);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ İlk kullanım kontrolü sırasında hata:", error);
        setError(
          "Uygulama başlatılırken bir hata oluştu. Lütfen tekrar deneyin."
        );
        setIsFirstLaunch(true);
        setIsLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  if (isLoading) {
    console.log("⏳ Uygulama yükleniyor...");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", textAlign: "center", padding: 20 }}>
          {error}
        </Text>
      </View>
    );
  }

  console.log("🎯 Uygulama başlatıldı, navigasyon hazırlanıyor...");

  return (
    <ThemeProvider>
      <MedicineProvider>
        <Container style={{ flex: 1 }}>
          <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {isFirstLaunch ? (
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
              ) : null}
              <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
              <Stack.Screen
                name="EditMedicine"
                component={EditMedicineScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </Container>
      </MedicineProvider>
    </ThemeProvider>
  );
};

export default App;

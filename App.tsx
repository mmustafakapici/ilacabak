import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MedicinesScreen } from "./src/screens/MedicinesScreen";
import { DailyMedicineScreen } from "./src/screens/CalendarScreen";
import { RemindersScreen } from "./src/screens/RemindersScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { AddMedicineScreen } from "./src/screens/AddMedicineScreen";
import { EditMedicineScreen } from "./src/screens/EditMedicineScreen";
import { StorageService } from "./src/services/storage";
import { View, Text, StyleSheet } from "react-native";
import { MedicineProvider, useMedicine } from "./src/context/MedicineContext";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const { reminderCount } = useMedicine();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#757575",
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="İlaçlarım"
        component={MedicinesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medication" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Günlük Program"
        component={DailyMedicineScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Hatırlatmalar"
        component={RemindersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={tabStyles.iconContainer}>
              <MaterialIcons name="notifications" size={size} color={color} />
              {reminderCount > 0 && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>{reminderCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -5,
    backgroundColor: "#F44336",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddMedicine"
        component={AddMedicineScreen}
        options={{
          title: "Yeni İlaç Ekle",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "500",
          },
        }}
      />
      <Stack.Screen
        name="EditMedicine"
        component={EditMedicineScreen}
        options={{
          title: "İlacı Düzenle",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "500",
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      setIsFirstLaunch(!profile);
    } catch (error) {
      console.error("İlk açılış kontrolünde hata:", error);
    }
  };

  const handleWelcomeComplete = () => {
    setIsFirstLaunch(false);
  };

  if (isFirstLaunch) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <NavigationContainer>
      <MedicineProvider>
        <AppNavigator />
      </MedicineProvider>
    </NavigationContainer>
  );
}

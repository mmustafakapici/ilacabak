import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { HomeScreen } from "../screens/HomeScreen";
import { MedicinesScreen } from "../screens/MedicinesScreen";
import { RemindersScreen } from "../screens/RemindersScreen";
import { DailyMedicineScreen } from "../screens/CalendarScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 85,
          paddingBottom: 16,
          paddingTop: 12,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#9E9E9E",
        headerShown: true,
        headerStyle: {
          height: 70,
          backgroundColor: "white",
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: "600",
          color: "#212121",
        },
      }}
    >
      <Tab.Screen
        name="AnaSayfa"
        component={HomeScreen}
        options={{
          tabBarLabel: "Ana Sayfa",
          headerTitle: "Günlük Program",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={32} />
          ),
        }}
      />
      <Tab.Screen
        name="Ilaclarim"
        component={MedicinesScreen}
        options={{
          tabBarLabel: "İlaçlarım",
          headerTitle: "İlaçlarım",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pill" color={color} size={32} />
          ),
        }}
      />
      <Tab.Screen
        name="Hatirlatmalar"
        component={RemindersScreen}
        options={{
          tabBarLabel: "Hatırlatmalar",
          headerTitle: "Hatırlatmalar",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={32} />
          ),
        }}
      />
      <Tab.Screen
        name="GunlukProgram"
        component={DailyMedicineScreen}
        options={{
          tabBarLabel: "Program",
          headerTitle: "Günlük İlaç Programı",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-today"
              color={color}
              size={32}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          headerTitle: "Profil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={32} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

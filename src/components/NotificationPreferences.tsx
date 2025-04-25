import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface NotificationSettings {
  medicationReminders: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notifyRelatives: boolean;
  reminderTime: string;
  missedDoseDelay: string;
}

export const NotificationPreferences = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    medicationReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
    notifyRelatives: true,
    reminderTime: "15",
    missedDoseDelay: "30",
  });

  const handleSave = () => {
    // TODO: Ayarları kaydetme işlemi
    console.log("Ayarlar kaydedildi:", settings);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genel Bildirim Ayarları</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="notifications" size={24} color="#2196F3" />
            <Text style={styles.settingText}>İlaç Hatırlatmaları</Text>
          </View>
          <Switch
            value={settings.medicationReminders}
            onValueChange={(value) =>
              setSettings({ ...settings, medicationReminders: value })
            }
            trackColor={{ false: "#757575", true: "#81C784" }}
            thumbColor={settings.medicationReminders ? "#4CAF50" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="volume-up" size={24} color="#2196F3" />
            <Text style={styles.settingText}>Sesli Bildirimler</Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) =>
              setSettings({ ...settings, soundEnabled: value })
            }
            trackColor={{ false: "#757575", true: "#81C784" }}
            thumbColor={settings.soundEnabled ? "#4CAF50" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="vibration" size={24} color="#2196F3" />
            <Text style={styles.settingText}>Titreşimli Bildirimler</Text>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) =>
              setSettings({ ...settings, vibrationEnabled: value })
            }
            trackColor={{ false: "#757575", true: "#81C784" }}
            thumbColor={settings.vibrationEnabled ? "#4CAF50" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="group" size={24} color="#2196F3" />
            <Text style={styles.settingText}>Yakınlara Bildirim</Text>
          </View>
          <Switch
            value={settings.notifyRelatives}
            onValueChange={(value) =>
              setSettings({ ...settings, notifyRelatives: value })
            }
            trackColor={{ false: "#757575", true: "#81C784" }}
            thumbColor={settings.notifyRelatives ? "#4CAF50" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zamanlama Ayarları</Text>

        <View style={styles.timeSettingItem}>
          <Text style={styles.timeSettingLabel}>
            İlaç Saatinden Kaç Dakika Önce Hatırlatılsın?
          </Text>
          <TextInput
            style={styles.timeInput}
            value={settings.reminderTime}
            onChangeText={(text) =>
              setSettings({ ...settings, reminderTime: text })
            }
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.timeUnit}>dakika</Text>
        </View>

        <View style={styles.timeSettingItem}>
          <Text style={styles.timeSettingLabel}>
            İlaç Alınmadığında Kaç Dakika Sonra Tekrar Hatırlatılsın?
          </Text>
          <TextInput
            style={styles.timeInput}
            value={settings.missedDoseDelay}
            onChangeText={(text) =>
              setSettings({ ...settings, missedDoseDelay: text })
            }
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.timeUnit}>dakika</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Ayarları Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#212121",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#212121",
  },
  timeSettingItem: {
    marginBottom: 16,
  },
  timeSettingLabel: {
    fontSize: 16,
    color: "#212121",
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    width: "30%",
  },
  timeUnit: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

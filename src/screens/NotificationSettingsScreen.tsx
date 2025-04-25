import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StorageService, Settings } from "../services/storage";
import { NotificationService } from "../services/notification";

interface NotificationSettingsScreenProps {
  onClose: () => void;
}

export const NotificationSettingsScreen = ({
  onClose,
}: NotificationSettingsScreenProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await StorageService.getSettings();
      setSettings(loadedSettings);
      setSelectedTimes(loadedSettings.notificationTimes);
    } catch (error) {
      console.error("Ayarlar yüklenirken hata:", error);
    }
  };

  const handleToggleSetting = async (key: keyof Settings) => {
    if (settings) {
      const newSettings = { ...settings, [key]: !settings[key] };
      setSettings(newSettings);
      await StorageService.saveSettings(newSettings);
    }
  };

  const handleTimeToggle = (minutes: number) => {
    setSelectedTimes((prev) => {
      const newTimes = prev.includes(minutes)
        ? prev.filter((time) => time !== minutes)
        : [...prev, minutes];
      return newTimes;
    });
  };

  const handleSaveTimes = async () => {
    try {
      if (settings) {
        const newSettings = { ...settings, notificationTimes: selectedTimes };
        await StorageService.saveSettings(newSettings);
        setSettings(newSettings);
        Alert.alert("Başarılı", "Bildirim zamanları güncellendi.");
      }
    } catch (error) {
      console.error("Bildirim zamanları kaydedilirken hata:", error);
      Alert.alert("Hata", "Bildirim zamanları kaydedilemedi.");
    }
  };

  const renderTimeButton = (minutes: number) => (
    <TouchableOpacity
      style={[
        styles.timeButton,
        selectedTimes.includes(minutes) && styles.timeButtonActive,
      ]}
      onPress={() => handleTimeToggle(minutes)}
    >
      <Text
        style={[
          styles.timeButtonText,
          selectedTimes.includes(minutes) && styles.timeButtonTextActive,
        ]}
      >
        {minutes} dakika
      </Text>
    </TouchableOpacity>
  );

  if (!settings) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Türleri</Text>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={async () => {
              if (selectedTimes.length === 0) {
                Alert.alert("Uyarı", "Lütfen önce hatırlatma zamanı seçin.");
                return;
              }

              // İlk seçili zamanı kullan
              const minutes = selectedTimes[0];
              const success = await NotificationService.sendDemoNotification(
                minutes
              );

              if (success) {
                Alert.alert(
                  "Demo Bildirimi",
                  `${minutes} dakika sonra bir bildirim alacaksınız. Lütfen bekleyin.`
                );
              } else {
                Alert.alert(
                  "Hata",
                  "Bildirim izinleri verilmediği için demo bildirimi gönderilemedi."
                );
              }
            }}
          >
            <MaterialIcons name="notifications" size={24} color="white" />
            <Text style={styles.demoButtonText}>Bildirim Demosu</Text>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sesli Bildirimler</Text>
              <Text style={styles.settingDescription}>
                İlaç saatlerinde sesli bildirim alın
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={() => handleToggleSetting("soundEnabled")}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Titreşim</Text>
              <Text style={styles.settingDescription}>
                Bildirimlerle birlikte titreşim alın
              </Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={() => handleToggleSetting("vibrationEnabled")}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sesli Komutlar</Text>
              <Text style={styles.settingDescription}>
                Sesli komutlarla ilaç ekleyin ve düzenleyin
              </Text>
            </View>
            <Switch
              value={settings.voiceEnabled}
              onValueChange={() => handleToggleSetting("voiceEnabled")}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Yakınlara Bildirim</Text>
              <Text style={styles.settingDescription}>
                İlaç alınmadığında yakınlarınıza bildirim gönderin
              </Text>
            </View>
            <Switch
              value={settings.notifyRelatives}
              onValueChange={() => handleToggleSetting("notifyRelatives")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hatırlatma Zamanları</Text>
          <Text style={styles.sectionDescription}>
            İlaç saatinden kaç dakika önce hatırlatma almak istersiniz?
          </Text>
          <View style={styles.timeButtonsContainer}>
            {renderTimeButton(1)}
            {renderTimeButton(5)}
            {renderTimeButton(15)}
            {renderTimeButton(30)}
            {renderTimeButton(60)}
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveTimes}>
            <Text style={styles.saveButtonText}>
              Hatırlatma Zamanlarını Kaydet
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <MaterialIcons name="info" size={24} color="#2196F3" />
          <Text style={styles.infoText}>
            Seçtiğiniz zamanlarda "X dakika sonra almanız gereken ilaçlar var"
            şeklinde bildirim alacaksınız.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212121",
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 16,
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
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: "#212121",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#757575",
  },
  timeButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  timeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  timeButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  timeButtonText: {
    fontSize: 16,
    color: "#212121",
  },
  timeButtonTextActive: {
    color: "white",
  },
  saveButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 12,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  demoButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
